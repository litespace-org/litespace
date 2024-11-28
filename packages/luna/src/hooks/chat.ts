import { IFilter, IMessage, IRoom } from "@litespace/types";
import { concat } from "lodash";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useInfinteScroll } from "@/hooks/common";
import { useSearchParams } from "react-router-dom";

type State = {
  room: number | null;
  /**
   * Map from room id to the current room page
   */
  pages: Record<number, number | undefined>;
  /**
   * Map from room id to its messages
   */
  messages: Record<number, IMessage.Self[] | undefined>;
  freshMessages: Record<number, IMessage.Self[] | undefined>;
  /**
   * Map from room id to the total number of messages that the room has.
   */
  totals: Record<number, number | undefined>;
  /**
   * Map from room id to loading state
   */
  loading: Record<number, boolean | undefined>;
  /**
   * Map from room id to fetching state
   */
  fetching: Record<number, boolean | undefined>;
  /**
   * Map from room id to fetching state
   */
  errors: Record<number, string | null | undefined>;
};

const initial: State = {
  room: 0,
  pages: {},
  messages: {},
  freshMessages: {},
  totals: {},
  loading: {},
  fetching: {},
  errors: {},
};

enum ActionType {
  AppendRoomMessages,
  setTotalMessages,
  SetPage,
  SetLoading,
  SetFetching,
  SetError,
  PreCall,
  PostCall,
  PostCallError,
  AddMessage,
  UpdateMessage,
  DeleteMessage,
}

export enum MessageStream {
  Add = "add",
  Update = "update",
  Delete = "delete",
}

export type MessageStreamAction =
  | { type: MessageStream.Add; message: IMessage.Self }
  | { type: MessageStream.Update; message: IMessage.Self }
  | { type: MessageStream.Delete; messageId: number; roomId: number };

type Action =
  | {
      type: ActionType.AppendRoomMessages;
      room: number;
      messages: IMessage.Self[];
    }
  | {
      type: ActionType.setTotalMessages;
      room: number;
      total: number;
    }
  | {
      type: ActionType.SetPage;
      room: number;
      page: number;
    }
  | {
      type: ActionType.SetLoading;
      room: number;
      loading: boolean;
    }
  | {
      type: ActionType.SetError;
      room: number;
      error: string | null | undefined;
    }
  | { type: ActionType.SetFetching; room: number; fetching: boolean }
  | {
      type: ActionType.PreCall;
      room: number;
      loading: boolean;
      fetching: boolean;
      page: number;
    }
  | {
      type: ActionType.PostCall;
      messages: IMessage.Self[];
      room: number;
      total: number;
    }
  | MessageStreamAction;

function isFreshMessage(id: number, messages: IMessage.Self[]): boolean {
  return !!messages.find((message) => message.id === id);
}

function replaceMessage(incoming: IMessage.Self, messages: IMessage.Self[]) {
  const index = messages.findIndex((message) => message.id === incoming.id);
  if (index === -1) return;
  messages.splice(index, 1, incoming);
  return messages;
}

function reducer(state: State, action: Action) {
  const mutate = (incoming: Partial<State> = {}): State => ({
    ...structuredClone(state),
    ...incoming,
  });

  if (action.type === ActionType.AppendRoomMessages) {
    const messages = structuredClone(state.messages);
    const roomMessages = messages[action.room];
    if (!roomMessages) messages[action.room] = action.messages;
    else roomMessages.push(...action.messages);
    return mutate({ messages });
  }

  if (action.type === ActionType.setTotalMessages) {
    const totals = structuredClone(state.totals);
    totals[action.room] = action.total;
    return mutate({ totals });
  }

  if (action.type === ActionType.SetPage) {
    const pages = structuredClone(state.pages);
    pages[action.room] = action.page;
    return mutate({ pages });
  }

  if (action.type === ActionType.SetLoading) {
    const loading = structuredClone(state.loading);
    loading[action.room] = action.loading;
    return mutate({ loading });
  }

  if (action.type === ActionType.SetFetching) {
    const fetching = structuredClone(state.fetching);
    fetching[action.room] = action.fetching;
    return mutate({ fetching });
  }

  if (action.type === ActionType.SetError) {
    const errors = structuredClone(state.errors);
    const fetching = structuredClone(state.fetching);
    const loading = structuredClone(state.loading);

    errors[action.room] = action.error;
    fetching[action.room] = false;
    loading[action.room] = false;

    return mutate({ errors, fetching, loading });
  }

  if (action.type === ActionType.PreCall) {
    const loading = structuredClone(state.loading);
    const fetching = structuredClone(state.fetching);
    const pages = structuredClone(state.pages);

    loading[action.room] = action.loading;
    fetching[action.room] = action.fetching;
    pages[action.room] = action.page;

    return mutate({ loading, fetching, pages });
  }

  if (action.type === ActionType.PostCall) {
    const totals = structuredClone(state.totals);
    totals[action.room] = action.total;

    const messages = structuredClone(state.messages);
    const roomMessages = messages[action.room];
    if (!roomMessages) messages[action.room] = action.messages;
    else roomMessages.push(...action.messages);

    const errors = structuredClone(state.errors);
    errors[action.room] = null;

    const fetching = structuredClone(state.fetching);
    fetching[action.room] = false;

    const loading = structuredClone(state.loading);
    loading[action.room] = false;

    return mutate({ totals, messages, errors, fetching, loading });
  }

  if (action.type === MessageStream.Add) {
    const room = action.message.roomId;
    const freshMessages = structuredClone(state.freshMessages);
    const roomMessages = freshMessages[room];
    if (!roomMessages) freshMessages[room] = [action.message];
    else roomMessages.push(action.message);
    return mutate({ freshMessages });
  }

  if (action.type === MessageStream.Update) {
    const room = action.message.roomId;
    const messageId = action.message.id;
    const fresh = isFreshMessage(messageId, state.freshMessages[room] || []);
    const messages = fresh
      ? structuredClone(state.freshMessages)
      : structuredClone(state.messages);

    const roomMessages = messages[room] || [];
    messages[room] = replaceMessage(action.message, roomMessages);
    if (fresh) return mutate({ freshMessages: messages });
    return mutate({ messages });
  }

  if (action.type === MessageStream.Delete) {
    const room = action.roomId;
    const messageId = action.messageId;
    const fresh = isFreshMessage(messageId, state.freshMessages[room] || []);
    const messages = fresh
      ? structuredClone(state.freshMessages)
      : structuredClone(state.messages);
    const roomMessages = messages[room] || [];
    messages[room] = roomMessages.filter((message) => message.id !== messageId);
    if (fresh) return mutate({ freshMessages: messages });
    return mutate({ messages });
  }

  return mutate();
}

export function useMessages<T extends HTMLElement = HTMLElement>(
  finder: (
    id: number,
    pagination?: IFilter.Pagination
  ) => Promise<IMessage.FindRoomMessagesApiResponse>,
  room: number | null
) {
  const [state, dispatch] = useReducer(reducer, initial);

  const isFull = useCallback(
    (room: number) => {
      const total = state.totals[room];
      const messages = state.messages[room];
      const full = !!total && !!messages && messages.length >= total;
      return total === 0 || full;
    },
    [state.messages, state.totals]
  );

  const fetcher = useCallback(
    async (room: number | null, page: number) => {
      if (!room) return;
      const full = isFull(room);
      const done = state.pages[room] === page;
      if (
        full ||
        done ||
        state.loading[room] ||
        state.errors[room] ||
        state.fetching[room]
      )
        return;

      try {
        dispatch({
          type: ActionType.PreCall,
          loading: !state.messages[room],
          fetching: true,
          room,
          page,
        });
        const { list: messages, total } = await finder(room, { page });
        dispatch({ type: ActionType.PostCall, room, messages, total });
      } catch (error) {
        dispatch({
          type: ActionType.SetError,
          error: error instanceof Error ? error.message : "unkown",
          room,
        });
      }
    },
    [
      finder,
      isFull,
      state.errors,
      state.fetching,
      state.loading,
      state.messages,
      state.pages,
    ]
  );

  const enabled = useMemo(() => {
    return (
      !!room &&
      !!state.pages[room] &&
      !state.loading[room] &&
      !state.errors[room]
    );
  }, [room, state.errors, state.loading, state.pages]);

  const more = useCallback(() => {
    if (!room) return;
    const page = state.pages[room];
    if (!page || isFull(room)) return;
    return fetcher(room, page + 1);
  }, [fetcher, isFull, room, state.pages]);

  const onMessage = useCallback((action: MessageStreamAction) => {
    dispatch(action);
  }, []);

  useEffect(() => {
    const page = 1;
    if (
      !!room &&
      !state.pages[room] &&
      !state.messages[room] &&
      !state.loading[room] &&
      !state.errors[room]
    )
      fetcher(room, page);
  }, [fetcher, room, state.errors, state.loading, state.messages, state.pages]);

  const { target } = useInfinteScroll<T>(more, enabled);

  const messages = useMemo((): IMessage.Self[] => {
    if (!room) return [];
    const messages = state.messages[room] || [];
    const fresh = state.freshMessages[room] || [];
    return concat(messages, fresh);
  }, [room, state.freshMessages, state.messages]);

  return useMemo(() => {
    return {
      messages,
      loading: room ? state.loading[room] : false,
      fetching: room ? state.fetching[room] : false,
      target,
      onMessage,
    };
  }, [messages, onMessage, room, state.fetching, state.loading, target]);
}

export type SelectedRoom = {
  room: number | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"] | null;
};

export type SelectRoom = (payload: {
  room: number;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
}) => void;

const ROOM_URL_PARAM = "room";
const ROOM_CACHE_KEY = "litespace:chat::room";

function asRoomId(room: string | null): number | null {
  if (!room) return null;
  const id = Number(room);
  if (Number.isNaN(id)) return null;
  return id;
}

function saveRoom(room: number) {
  localStorage.setItem(ROOM_CACHE_KEY, room.toString());
  return room;
}

function getCachedRoom() {
  const room = localStorage.getItem(ROOM_CACHE_KEY);
  return asRoomId(room);
}

function getRoomParam(params: URLSearchParams): number | null {
  const room = params.get(ROOM_URL_PARAM);
  return asRoomId(room);
}

export function useSelectedRoom() {
  const [params, setParams] = useSearchParams();

  const preSelection = useMemo(() => {
    const room = getRoomParam(params);
    if (room) return saveRoom(room);
    return getCachedRoom();
  }, [params]);

  const [selected, setSelected] = useState<SelectedRoom>({
    room: preSelection,
    otherMember: null,
  });

  const select: SelectRoom = useCallback(
    (payload) => {
      saveRoom(payload.room);
      setSelected(payload);
      setParams({
        [ROOM_URL_PARAM]: payload.room.toString(),
      });
    },
    [setParams]
  );

  return {
    selected,
    select,
  };
}
