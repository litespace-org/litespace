import { IFilter, IMessage, IRoom } from "@litespace/types";
import { clone, isUndefined, merge } from "lodash";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

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
  error: Error | null;
};

const initial: State = {
  room: 0,
  roomPage: {},
  roomMessages: {},
  roomTotalMessages: {},
  loading: false,
  error: null,
};

enum ActionType {
  AppendRoomMessages,
  setTotalMessages,
  SetPage,
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
    };

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

  return mutate();
}

export function useMessages(
  finder: (
    id: number,
    pagination?: IFilter.Pagination
  ) => Promise<IMessage.FindRoomMessagesApiResponse>,
  room: number | null
) {
  const [state, dispatch] = useReducer(reducer, initial);

  const fetcher = useCallback(
    async (room: number | null, page: number) => {
      if (!room) return;
      const prevTotal = state.roomTotalMessages[room];
      const prevMessages = state.roomMessages[room];
      const full =
        prevTotal && prevMessages && prevMessages.length >= prevTotal;
      const done = state.roomPage[room] === page;

      console.log({ done, full, roomPage: state.roomPage });
      if (full || done) return;

      const { list: messages, total } = await finder(room, { page });

      dispatch({
        type: ActionType.setTotalMessages,
        total,
        room,
      });
      dispatch({
        type: ActionType.AppendRoomMessages,
        messages,
        room,
      });
      dispatch({
        type: ActionType.SetPage,
        page,
        room,
      });
    },
    [finder, state.roomMessages, state.roomPage, state.roomTotalMessages]
  );

  useEffect(() => {
    fetcher(room, 1);
  }, [fetcher, room]);

  const messages = useMemo((): IMessage.Self[] => {
    if (!room) return [];
    console.log("len: ", state.roomMessages[room]?.length);
    return state.roomMessages[room] || [];
  }, [room, state.roomMessages]);

  return { messages };
}
