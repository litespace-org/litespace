import { useAtlas } from "@/atlas";
import { IRoom, Wss, IMessage, Void, IFilter } from "@litespace/types";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSocket } from "@/socket";
import { concat } from "lodash";

type OnSuccess = Void;
type OnError = (err: Error) => void;

enum MessageStream {
  Add = "add",
  Update = "update",
  Delete = "delete",
}
type MessageStreamAction =
  | { type: MessageStream.Add; message: IMessage.Self }
  | { type: MessageStream.Update; message: IMessage.Self }
  | { type: MessageStream.Delete; messageId: number; roomId: number };

export function useFindRoomMembers(
  roomId: number | null
): UseQueryResult<IRoom.FindRoomMembersApiResponse, Error> {
  const atlas = useAtlas();
  const findRoomMembers = useCallback(async () => {
    if (!roomId) return [];
    return await atlas.chat.findRoomMembers(roomId);
  }, [atlas.chat, roomId]);

  return useQuery({
    queryFn: findRoomMembers,
    queryKey: [QueryKey.FindRoomMembers, roomId],
    enabled: !!roomId,
  });
}

export function useFindUserRooms(
  userId?: number,
  payload?: IRoom.FindUserRoomsApiQuery
): UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord> {
  const atlas = useAtlas();
  const findUserRooms = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      if (!userId) return { list: [], total: 0 };
      return await atlas.chat.findRooms(userId, {
        page: pageParam,
        ...payload,
      });
    },
    [atlas.chat, userId, payload]
  );

  return useInfinitePaginationQuery(findUserRooms, [
    QueryKey.FindUserRooms,
    payload,
  ]);
}

export function useUpdateRoom({
  onSuccess,
  onError,
}: {
  onSuccess?: OnSuccess;
  onError?: OnError;
}) {
  const atlas = useAtlas();
  const pinRoom = useCallback(
    async ({
      roomId,
      payload,
    }: {
      roomId: number;
      payload: IRoom.UpdateRoomApiPayload;
    }) => {
      await atlas.chat.updateRoom(roomId, payload);
    },
    [atlas.chat]
  );

  return useMutation({
    mutationFn: pinRoom,
    mutationKey: [MutationKey.UpdateRoom],
    onSuccess,
    onError,
  });
}

export type OnMessage = (action: MessageStreamAction) => void;

/**
 * The hook responsible for integration with the wss server, it allows the user to send
 * delete and update messages.
 * @param onMessage : The action the user has done
 * @returns Send, update, delete functions which are wss emitters
 */
export function useChat(onMessage?: OnMessage) {
  const socket = useSocket();

  const sendMessage = useCallback(
    ({ roomId, text }: { roomId: number; text: string }) => {
      // the callback at the end will only give me errors
      socket?.emit(Wss.ClientEvent.SendMessage, { roomId, text });
    },
    [socket]
  );

  const updateMessage = useCallback(
    ({ id, text }: { id: number; text: string }) => {
      socket?.emit(Wss.ClientEvent.UpdateMessage, { id, text });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (id: number) => {
      socket?.emit(Wss.ClientEvent.DeleteMessage, { id });
    },
    [socket]
  );

  const onRoomMessage = useCallback(
    (message: IMessage.Self) => {
      if (!onMessage) return;
      return onMessage({
        type: MessageStream.Add,
        message,
      });
    },
    [onMessage]
  );

  const onUpdateMessage = useCallback(
    (message: IMessage.Self) => {
      if (!onMessage) return;
      return onMessage({
        type: MessageStream.Update,
        message,
      });
    },
    [onMessage]
  );

  const onDeleteMessage = useCallback(
    ({ roomId, messageId }: { roomId: number; messageId: number }) => {
      if (!onMessage) return;
      return onMessage({ type: MessageStream.Delete, roomId, messageId });
    },
    [onMessage]
  );

  useEffect(() => {
    if (!onMessage || !socket) return;
    socket.on(Wss.ServerEvent.RoomMessage, onRoomMessage);
    socket.on(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
    socket.on(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
    return () => {
      socket.off(Wss.ServerEvent.RoomMessage, onRoomMessage);
      socket.off(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
      socket.off(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
    };
  }, [onDeleteMessage, onMessage, onRoomMessage, onUpdateMessage, socket]);

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
  };
}

type State = {
  /**
   * Current active room id
   */
  room: number | null;
  /**
   * Map from room id to the current room page
   */
  pages: Record<number, number | undefined>;
  /**
   * Map from room id to its messages from the backend
   */
  messages: Record<number, IMessage.Self[] | undefined>;
  /**
   * Map from room id to its fresh messages (new messages received since the last page refresh)
   */
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
   * Map from room id to error messages
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
  /**
   * function to mutate the current state
   * you clone the previous state, then replace some properties with new copies
   * (you must send another copy, not part of the new state)
   */
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

// use the findRoom atlas function instead of the finder
export function useMessages(room: number | null, userId: number) {
  const atlas = useAtlas();
  const [state, dispatch] = useReducer(reducer, initial);

  /**
   * a flag indicating that no more messages can be retrieved
   */
  const isFull = useCallback(
    (room: number) => {
      const total = state.totals[room];
      const messages = state.messages[room];
      const full = !!total && !!messages && messages.length >= total;
      return total === 0 || full;
    },
    [state.messages, state.totals]
  );

  const findRoomMessages = useCallback(
    async (id: number, pagination?: IFilter.Pagination) => {
      return await atlas.chat.findRoomMessages(id, pagination);
    },
    [atlas.chat]
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
        const { list: messages, total } = await findRoomMessages(room, {
          page,
        });
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
      isFull,
      state.errors,
      state.fetching,
      state.loading,
      state.messages,
      state.pages,
      findRoomMessages,
    ]
  );

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

  /**
   * list of messages in the chat
   */
  const messages = useMemo((): IMessage.Self[] => {
    if (!room) return [];
    const messages =
      state.messages[room]?.map((message) => {
        const isOwner = message.userId === userId;
        let messageState;
        if (!isOwner) messageState = undefined;
        else messageState = message.read ? "seen" : "reached";

        return {
          ...message,
          messageState,
        };
      }) || [];
    const fresh = state.freshMessages[room] || [];

    // we will sort fresh messages to make sure no error has happened
    const sortedFreshMessages = fresh.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return concat(messages, sortedFreshMessages);
  }, [room, state.freshMessages, state.messages, userId]);

  return useMemo(() => {
    return {
      messages,
      loading: room ? state.loading[room] : false,
      fetching: room ? state.fetching[room] : false,
      more,
      onMessage,
    };
  }, [messages, onMessage, room, state.fetching, state.loading, more]);
}
