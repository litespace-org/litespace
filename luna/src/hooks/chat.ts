import { IFilter, IMessage } from "@litespace/types";
import { merge } from "lodash";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useInfinteScroll } from "@/hooks/common";

type State = {
  room: number | null;
  /**
   * Map from room id to the current room page
   */
  roomPage: Record<number, number>;
  /**
   * Map from room id to its messages
   */
  roomMessages: Record<number, IMessage.Self[]>;
  /**
   * Map from room id to the total number of messages that the room has.
   */
  roomTotalMessages: Record<number, number>;
  loading: boolean;
  fetching: boolean;
  error: unknown | null;
};

const initial: State = {
  room: 0,
  roomPage: {},
  roomMessages: {},
  roomTotalMessages: {},
  loading: false,
  fetching: false,
  error: null,
};

enum ActionType {
  AppendRoomMessages,
  setTotalMessages,
  SetPage,
  SetLoading,
  SetFetching,
  SetError,
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
      loading: boolean;
    }
  | {
      type: ActionType.SetError;
      error: string | null;
    }
  | { type: ActionType.SetFetching; fetching: boolean };

function reducer(state: State, action: Action) {
  const mutate = (incoming?: Partial<State>): State =>
    merge(structuredClone(state), incoming);

  if (action.type === ActionType.AppendRoomMessages) {
    const roomMessagesMap = structuredClone(state.roomMessages);
    const roomMessages = roomMessagesMap[action.room];
    if (!roomMessages) roomMessagesMap[action.room] = action.messages;
    else roomMessagesMap[action.room].push(...action.messages);
    return mutate({ roomMessages: roomMessagesMap });
  }

  if (action.type === ActionType.setTotalMessages) {
    const roomTotalMessages = structuredClone(state.roomTotalMessages);
    roomTotalMessages[action.room] = action.total;
    return mutate({ roomTotalMessages });
  }

  if (action.type === ActionType.SetPage) {
    const roomPage = structuredClone(state.roomPage);
    roomPage[action.room] = action.page;
    return mutate({ roomPage });
  }

  if (action.type === ActionType.SetLoading)
    return mutate({ loading: action.loading });

  if (action.type === ActionType.SetFetching)
    return mutate({ fetching: action.fetching });

  if (action.type === ActionType.SetError)
    return mutate({ error: action.error });

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
      const total = state.roomTotalMessages[room];
      const messages = state.roomMessages[room];
      const full = !!total && !!messages && messages.length >= total;
      return total === 0 || full;
    },
    [state.roomMessages, state.roomTotalMessages]
  );

  const fetcher = useCallback(
    async (room: number | null, page: number) => {
      if (!room) return;
      const full = isFull(room);
      const done = state.roomPage[room] === page;
      if (full || done || state.loading || state.error || state.fetching)
        return;

      try {
        dispatch({
          type: ActionType.SetLoading,
          loading: !state.roomMessages[room],
        });
        dispatch({ type: ActionType.SetPage, page, room });
        dispatch({ type: ActionType.SetFetching, fetching: true });
        const { list: messages, total } = await finder(room, { page });
        dispatch({ type: ActionType.setTotalMessages, total, room });
        dispatch({ type: ActionType.AppendRoomMessages, messages, room });
        dispatch({ type: ActionType.SetError, error: null });
      } catch (error) {
        dispatch({
          type: ActionType.SetError,
          error: error instanceof Error ? error.message : "unkown",
        });
      }
      dispatch({ type: ActionType.SetLoading, loading: false });
      dispatch({ type: ActionType.SetFetching, fetching: false });
    },
    [
      finder,
      isFull,
      state.error,
      state.fetching,
      state.loading,
      state.roomMessages,
      state.roomPage,
    ]
  );

  // todo: error should be specific to the room
  const enabled = useMemo(() => {
    return !!room && !!state.roomPage[room] && !state.loading && !state.error;
  }, [room, state.error, state.loading, state.roomPage]);

  const more = useCallback(() => {
    if (!room) return;
    const page = state.roomPage[room];
    if (!page || isFull(room)) return;
    return fetcher(room, page + 1);
  }, [fetcher, isFull, room, state.roomPage]);

  useEffect(() => {
    const page = 1;
    if (
      !!room &&
      !state.roomPage[room] &&
      !state.roomMessages[room] &&
      !state.loading &&
      !state.error
    )
      fetcher(room, page);
  }, [
    fetcher,
    room,
    state.error,
    state.loading,
    state.roomMessages,
    state.roomPage,
  ]);

  const { target } = useInfinteScroll<T>(more, enabled);

  const messages = useMemo((): IMessage.Self[] => {
    if (!room) return [];
    return state.roomMessages[room] || [];
  }, [room, state.roomMessages]);

  return {
    messages,
    loading: state.loading,
    fetching: state.fetching,
    target,
  };
}
