import { useAtlas } from "@/atlas";
import {
  IRoom,
  Wss,
  IMessage,
  Void,
  IFilter,
  ITutor,
  Paginated,
} from "@litespace/types";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  useInfinitePaginationQuery,
  UseInfinitePaginationQueryResult,
} from "@/query";
import { MutationKey, QueryKey } from "@/constants";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSocket } from "@/socket";
import { concat, uniqueId } from "lodash";
import { useUserContext } from "@/user/index";

type OnSuccess = Void;
type OnError = (err: Error) => void;

enum MessageStream {
  Add = "add",
  Update = "update",
  Delete = "delete",
  Typing = "typing",
  Read = "read",
}

type MessageStreamAction =
  | { type: MessageStream.Add; message: IMessage.Self }
  | {
      type: MessageStream.Update;
      message: {
        id: number;
        text: string;
        roomId: number;
      };
      pending: boolean;
    }
  | { type: MessageStream.Delete; messageId: number; roomId: number }
  | {
      type: ActionType.AddPendingMessage;
      message: { text: string; room: number; refId: string; userId: number };
    }
  | {
      type: ActionType.ActivateMessage;
      message: IMessage.AttributedMessage;
    }
  | {
      type: ActionType.SendMessageFailure;
      message: {
        refId: string;
        room: number;
        errorMessage?: string;
      };
    }
  | {
      type: ActionType.UpdateMessageFailure;
      message: {
        id: number;
        room: number;
        errorType: ErrorType;
        errorMessage?: string;
      };
    }
  | {
      type: MessageStream.Read;
      messageId: number;
      roomId: number;
    };

type UserId = number;
type RoomId = number;
type RefId = string;
type MessageId = number;

type State = {
  /**
   * Current active room id
   */
  room: RoomId | null;
  /**
   * Map from room id to the current room page
   */
  pages: Record<RoomId, number | undefined>;
  /**
   * Map from room id to its messages from the backend
   */
  messages: Record<RoomId, IMessage.AttributedMessage[] | undefined>;
  /**
   * Map from room id to its fresh messages (new messages received since the last page refresh)
   */
  freshMessages: Record<RoomId, IMessage.AttributedMessage[] | undefined>;
  /**
   * Map from room id to the total number of messages that the room has.
   */
  totals: Record<RoomId, number | undefined>;
  /**
   * Map from room id to loading state
   */
  loading: Record<RoomId, boolean | undefined>;
  /**
   * Map from room id to fetching state
   */
  fetching: Record<RoomId, boolean | undefined>;
  /**
   * Map from room id to error messages (indicating problem with entire chat)
   */
  roomErrors: Record<RoomId, string | null | undefined>;
  /**
   * Map from room id to roomMessages to show the type of error that happened
   * will be used to determine the type of retry function in the front end
   */
  messageErrors: Record<RoomId, Record<MessageId | RefId, ErrorType>>;
};

type ErrorType = "send" | "update" | "delete";

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
  AddPendingMessage,
  ActivateMessage,
  /**
   * For when a send message fails
   */
  SendMessageFailure,
  /**
   * For when a delete/update message fails
   */
  UpdateMessageFailure,
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

export type OnMessage = (action: MessageStreamAction) => void;

export function useFindUncontactedTutors(): {
  query: UseInfiniteQueryResult<
    InfiniteData<Paginated<ITutor.FullUncontactedTutorInfo>, unknown>,
    Error
  >;
  list: ITutor.FullUncontactedTutorInfo[] | null;
  more: () => void;
} {
  const atlas = useAtlas();

  const findUncontactedTutors = useCallback(
    ({ pageParam }: { pageParam: number }) => {
      return atlas.user.findUncontactedTutors({ page: pageParam });
    },
    [atlas.user]
  );

  return useInfinitePaginationQuery(findUncontactedTutors, [
    QueryKey.FindUncontactedTutors,
  ]);
}

export function useCreateRoom({
  onSuccess,
  onError,
}: {
  onSuccess: (response: IRoom.CreateRoomApiResponse) => void;
  onError: Void;
}) {
  const atlas = useAtlas();
  const createRoom = useCallback(
    async ({ id, message }: { id: number; message?: string }) => {
      return await atlas.chat.createRoom(id, message);
    },
    [atlas.chat]
  );

  return useMutation({
    mutationFn: createRoom,
    onSuccess,
    onError,
    mutationKey: [MutationKey.CreateRoom],
  });
}

export function useFindRoomMembers(
  roomId: number | "temporary" | null
): UseQueryResult<IRoom.FindRoomMembersApiResponse, Error> {
  const atlas = useAtlas();
  const findRoomMembers = useCallback(async () => {
    if (!roomId || roomId === "temporary") return [];
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

/**
 * The hook responsible for integration with the wss server, it allows the user
 * to send delete and update messages. Each Socket Event takes 3 params: the
 * event, the payload, the callback which will be invoked in case of an error.
 *
 * @param onMessage : The action the user has done
 * @returns Send, update, delete functions which are wss emitters
 */
export function useChat(onMessage?: OnMessage, userId?: number) {
  const socket = useSocket();
  const sendMessage = useCallback(
    ({
      roomId,
      text,
      userId,
    }: {
      roomId: number;
      text: string;
      userId: number;
    }) => {
      if (!onMessage || !socket) return;
      const refId = uniqueId();
      socket.emit(
        Wss.ClientEvent.SendMessage,
        {
          roomId,
          text,
          refId,
        },
        // on failure of sending message
        (error) => {
          return onMessage({
            type: ActionType.SendMessageFailure,
            message: {
              room: roomId,
              refId,
              errorMessage: error?.message,
            },
          });
        }
      );

      return onMessage({
        type: ActionType.AddPendingMessage,
        message: { text, room: roomId, refId, userId },
      });
    },
    [socket, onMessage]
  );

  const updateMessage = useCallback(
    (message: { id: number; text: string; roomId: number }) => {
      if (!onMessage || !socket) return;
      socket.emit(
        Wss.ClientEvent.UpdateMessage,
        {
          id: message.id,
          text: message.text,
        },
        () => {
          onMessage({
            type: ActionType.UpdateMessageFailure,
            message: {
              id: message.id,
              room: message.roomId,
              errorType: "update",
            },
          });
        }
      );

      return onMessage({
        type: MessageStream.Update,
        message,
        pending: true,
      });
    },
    [socket, onMessage]
  );

  const deleteMessage = useCallback(
    (messageId: number, roomId: number) => {
      if (!onMessage || !socket) return;

      socket.emit(Wss.ClientEvent.DeleteMessage, { id: messageId }, () => {
        return onMessage({
          type: ActionType.UpdateMessageFailure,
          message: { id: messageId, room: roomId, errorType: "delete" },
        });
      });
      return onMessage({ type: MessageStream.Delete, roomId, messageId });
    },
    [socket, onMessage]
  );

  const readMessage = useCallback(
    (id: number) => {
      if (!socket) return;
      socket?.emit(Wss.ClientEvent.MarkMessageAsRead, { id });
    },
    [socket]
  );

  const ackUserTyping = useCallback(
    ({ roomId }: { roomId: number }) => {
      socket?.emit(Wss.ClientEvent.UserTyping, { roomId });
    },
    [socket]
  );

  const onRoomMessage = useCallback(
    (message: IMessage.AttributedMessage) => {
      if (!onMessage || !userId) return;

      // This is current user's message, so we activate the message from the pending state
      if (message.userId === userId)
        return onMessage({
          type: ActionType.ActivateMessage,
          message,
        });

      return onMessage({
        type: MessageStream.Add,
        message,
      });
    },
    [onMessage, userId]
  );

  const onUpdateMessage = useCallback(
    (message: IMessage.Self) => {
      if (!onMessage) return;
      return onMessage({
        type: MessageStream.Update,
        message,
        pending: false,
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

  const onReadMessage = useCallback(
    ({ messageId, roomId }: { messageId: number; roomId: number }) => {
      if (!onMessage) return;
      onMessage({ type: MessageStream.Read, messageId, roomId });
    },
    [onMessage]
  );

  useEffect(() => {
    if (!onMessage || !socket) return;
    socket.on(Wss.ServerEvent.RoomMessage, onRoomMessage);
    socket.on(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
    socket.on(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
    socket.on(Wss.ServerEvent.RoomMessageRead, onReadMessage);
    return () => {
      socket.off(Wss.ServerEvent.RoomMessage, onRoomMessage);
      socket.off(Wss.ServerEvent.RoomMessageUpdated, onUpdateMessage);
      socket.off(Wss.ServerEvent.RoomMessageDeleted, onDeleteMessage);
      socket.off(Wss.ServerEvent.RoomMessageRead, onReadMessage);
    };
  }, [
    onDeleteMessage,
    onMessage,
    onRoomMessage,
    onUpdateMessage,
    onReadMessage,
    socket,
  ]);

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
    readMessage,
    ackUserTyping,
  };
}

const initial: State = {
  room: 0,
  pages: {},
  messages: {},
  freshMessages: {},
  totals: {},
  loading: {},
  fetching: {},
  roomErrors: {},
  messageErrors: {},
};

function isFreshMessage(id: number, messages: IMessage.Self[]): boolean {
  return !!messages.find((message) => message.id === id);
}

// utility function used in updating the messages
function replaceMessage(
  incoming: { id: number; text: string; roomId: number },
  messages: IMessage.AttributedMessage[],
  pending?: boolean
) {
  const newMessages = messages.map((message) => {
    if (message.id === incoming.id) {
      return {
        ...message,
        ...incoming,
        messageState: (pending ? "pending" : "sent") as IMessage.MessageState,
      };
    }
    return message;
  });

  return newMessages;
}

function activateMessage(
  incoming: IMessage.AttributedMessage,
  messages: IMessage.AttributedMessage[]
) {
  return messages.map((message) => {
    if (message.refId == incoming.refId) {
      return incoming;
    }
    return message;
  });
}

const pendingMessageCreator = ({
  text,
  roomId,
  refId,
  userId,
}: {
  text: string;
  roomId: number;
  userId: number;
  refId: string;
}): IMessage.AttributedMessage => {
  const now = new Date().toISOString();
  return {
    id: 0,
    userId,
    roomId,
    text,
    refId,
    messageState: "pending",
    read: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  };
};

function makeErrorMessage(
  /**
   * the incoming message is either from a sending event (first type) or update or delete event (second type)
   */
  incoming: { refId: string; room: number } | { id: number; room: number },
  messages: IMessage.AttributedMessage[]
) {
  return messages.map((message) => {
    if (
      ("refId" in incoming && message.refId == incoming.refId) ||
      ("id" in incoming && message.id == incoming.id)
    ) {
      message.messageState = "error";
      message.deleted = false;
    }
    return message;
  });
}

/**
 * we set a deleted flag to true and don't outright delete the message becuase if an error has occured,
 * we can retrieve the message directly
 */
function deleteMessage(
  incomingId: number,
  messages: IMessage.AttributedMessage[]
) {
  return messages.map((message) => {
    if (message.id === incomingId) {
      message.deleted = true;
    }
    return message;
  });
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
    const roomErrors = structuredClone(state.roomErrors);
    const fetching = structuredClone(state.fetching);
    const loading = structuredClone(state.loading);

    roomErrors[action.room] = action.error;
    fetching[action.room] = false;
    loading[action.room] = false;

    return mutate({ roomErrors, fetching, loading });
  }

  if (action.type === ActionType.SendMessageFailure) {
    const room = action.message.room;
    const ref = action.message.refId;
    const freshMessages = structuredClone(state.freshMessages);
    const messageErrors = structuredClone(state.messageErrors);
    const roomErrors = messageErrors[room] || {};
    roomErrors[ref] = "send";
    const roomMessages = freshMessages[room] || [];

    freshMessages[room] = makeErrorMessage(action.message, roomMessages);
    messageErrors[room] = roomErrors;

    return mutate({ freshMessages, messageErrors });
  }

  if (action.type === ActionType.UpdateMessageFailure) {
    const room = action.message.room;
    const fresh = isFreshMessage(
      action.message.id,
      state.freshMessages[room] || []
    );
    const messages = fresh
      ? structuredClone(state.freshMessages)
      : structuredClone(state.messages);

    const roomMessages = messages[room] || [];
    messages[room] = makeErrorMessage(action.message, roomMessages);

    const messageErrors = structuredClone(state.messageErrors);
    const roomErrors = messageErrors[room] || {};
    roomErrors[action.message.id] = action.message.errorType;
    messageErrors[room] = roomErrors;

    if (fresh) return mutate({ freshMessages: messages, messageErrors });
    return mutate({ messages, messageErrors });
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
    if (!roomMessages) messages[action.room] = action.messages.reverse();
    else roomMessages.unshift(...action.messages.reverse());

    const roomErrors = structuredClone(state.roomErrors);
    roomErrors[action.room] = null;

    const fetching = structuredClone(state.fetching);
    fetching[action.room] = false;

    const loading = structuredClone(state.loading);
    loading[action.room] = false;

    return mutate({ totals, messages, roomErrors, fetching, loading });
  }

  if (action.type === MessageStream.Read) {
    const room = action.roomId;
    const messageId = action.messageId;
    const isFresh = isFreshMessage(messageId, state.freshMessages[room] || []);
    const messages = isFresh
      ? structuredClone(state.freshMessages)
      : structuredClone(state.messages);
    messages[room]?.map((message) => {
      if (message.id === messageId) {
        message.read = true;
        message.messageState = "seen";
      }
      return message;
    });

    if (isFresh) return mutate({ freshMessages: messages });
    return mutate({ messages });
  }

  if (action.type === ActionType.AddPendingMessage) {
    const room = action.message.room;
    const freshMessages = structuredClone(state.freshMessages);
    const roomMessages = freshMessages[room];

    const newMessage = pendingMessageCreator({
      text: action.message.text,
      refId: action.message.refId,
      roomId: action.message.room,
      userId: action.message.userId,
    });

    if (!roomMessages) freshMessages[room] = [newMessage];
    else roomMessages.push(newMessage);

    return mutate({ freshMessages });
  }

  if (action.type === ActionType.ActivateMessage) {
    const room = action.message.roomId;
    const freshMessages = structuredClone(state.freshMessages);
    const roomMessages = freshMessages[room] || [];

    const newFreshMessages = activateMessage(action.message, roomMessages);
    freshMessages[room] = newFreshMessages;

    return mutate({ freshMessages });
  }

  // MessageStream actions are all coming from the server itself
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
    messages[room] = replaceMessage(
      action.message,
      roomMessages,
      action.pending
    );

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
    messages[room] = deleteMessage(action.messageId, roomMessages);
    if (fresh) return mutate({ freshMessages: messages });
    return mutate({ messages });
  }

  return mutate();
}

/**
 *
 * @param room
 * @returns
 */
export function useMessages(room: number | "temporary" | null) {
  const atlas = useAtlas();
  const [state, dispatch] = useReducer(reducer, initial);

  /**
   * a flag indicating that no more messages can be retrieved
   */
  const fetchedAllMessages = useCallback(
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
    async (room: number | "temporary" | null, page: number) => {
      if (!room || room === "temporary") return;
      const full = fetchedAllMessages(room);
      const done = state.pages[room] === page;
      if (
        full ||
        done ||
        state.loading[room] ||
        state.roomErrors[room] ||
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
      fetchedAllMessages,
      state.roomErrors,
      state.fetching,
      state.loading,
      state.messages,
      state.pages,
      findRoomMessages,
    ]
  );

  const more = useCallback(() => {
    if (!room || room === "temporary") return;
    const page = state.pages[room];
    if (!page || fetchedAllMessages(room)) return;
    return fetcher(room, page + 1);
  }, [fetcher, fetchedAllMessages, room, state.pages]);

  const onMessage = useCallback((action: Action) => {
    dispatch(action);
  }, []);

  useEffect(() => {
    const page = 1;
    if (
      !!room &&
      room !== "temporary" &&
      !state.pages[room] &&
      !state.messages[room] &&
      !state.loading[room] &&
      !state.roomErrors[room]
    )
      fetcher(room, page);
  }, [
    fetcher,
    room,
    state.roomErrors,
    state.loading,
    state.messages,
    state.pages,
  ]);

  /**
   * list of messages in the chat
   */
  const messages = useMemo(() => {
    if (!room || room === "temporary") return [];
    const messages = state.messages[room] || [];
    const fresh =
      state.freshMessages[room]?.map((message) => {
        return {
          ...message,
          messageState: message.messageState,
        };
      }) || [];

    return concat(messages, fresh);
  }, [room, state.freshMessages, state.messages]);

  return useMemo(() => {
    return {
      messages,
      loading: room && room !== "temporary" ? state.loading[room] : false,
      fetching: room && room !== "temporary" ? state.fetching[room] : false,
      messageErrors: state.messageErrors,
      more,
      onMessage,
      error: room && room !== "temporary" ? state.roomErrors[room] : undefined,
    };
  }, [
    messages,
    onMessage,
    room,
    state.fetching,
    state.loading,
    state.roomErrors,
    state.messageErrors,
    more,
  ]);
}

export type RoomsMap = Partial<{
  [roomId: number]: { [userId: number]: boolean };
}>;

export function useChatStatus() {
  const socket = useSocket();
  const { user } = useUserContext();
  const userRooms = useFindUserRooms(user?.id);

  /**
   * A map from rooms to object containing both users in it and showing
   * if they are typing currently or not
   * ```ts
   * type TypingStaus = boolean; // true in case the user is typing.
   * type TypingMap = Record<RoomId, Record<UserId, TypingStatus>>;
   * ```
   */
  const [typingMap, setTypingMap] = useState<RoomsMap>({});

  /**
   * A map from rooms to object containing both users in it and showing
   * if they are online
   * ```ts
   * type OnlineStaus = boolean; // true in case the user is typing.
   * type OnlineMap = Record<RoomId, Record<UserId, OnlineStaus>>;
   * ```
   */
  const [usersOnlineMap, setUsersOnlineMap] = useState<RoomsMap>({});

  /**
   * object containing timers to remove the typing states from rooms (only if we didn't recieve the
   * UserTyping event from the server)
   */
  const typingTimeouts = useRef<Record<RoomId, Record<UserId, NodeJS.Timeout>>>(
    {}
  );

  const onUserTyping = useCallback(
    ({ userId, roomId }: Wss.EventPayload<Wss.ServerEvent.UserTyping>) => {
      const userIdTimeout = typingTimeouts.current[roomId]?.[userId];
      if (userIdTimeout) clearTimeout(userIdTimeout);

      setTypingMap((prev) => ({ ...prev, [roomId]: { [userId]: true } }));

      const timeout = setTimeout(() => {
        setTypingMap((prev) => ({ ...prev, [roomId]: { [userId]: false } }));
      }, 1000);

      typingTimeouts.current[roomId] = {
        ...typingTimeouts.current[roomId],
        [userId]: timeout,
      };
    },
    []
  );

  const onUserStatusChange = useCallback(
    ({
      online,
      userId,
      roomId,
    }: Wss.EventPayload<Wss.ServerEvent.UserStatusChanged>) =>
      setUsersOnlineMap((prev) => {
        const cloned = structuredClone(prev);
        cloned[roomId] = { ...cloned[roomId], [userId]: online };
        return cloned;
      }),
    []
  );

  // populate the map with data from the server
  useEffect(() => {
    const rooms: RoomsMap = {};
    userRooms.list?.forEach((room) => {
      rooms[room.roomId] = {
        [room.otherMember.id]: room.otherMember.online,
      };
    });
    setUsersOnlineMap(rooms);
  }, [userRooms.list]);

  useEffect(() => {
    socket?.on(Wss.ServerEvent.UserTyping, onUserTyping);
    socket?.on(Wss.ServerEvent.UserStatusChanged, onUserStatusChange);
    return () => {
      socket?.off(Wss.ServerEvent.UserTyping, onUserTyping);
      socket?.off(Wss.ServerEvent.UserStatusChanged, onUserStatusChange);
    };
  }, [socket, onUserTyping, onUserStatusChange]);

  return { typingMap, usersOnlineMap };
}
