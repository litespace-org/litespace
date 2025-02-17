import { capture } from "@/lib/sentry";
import { Route } from "@/types/routes";
import {
  useFindRoomByMembers,
  useFindUncontactedTutors,
  useFindUserRooms,
  useUpdateRoom,
} from "@litespace/headless/chat";
import { useUserContext } from "@litespace/headless/context/user";
import { UseInfinitePaginationQueryResult } from "@litespace/headless/query";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useRoomManager(isStudent: boolean) {
  const toast = useToast();
  const intl = useFormatMessage();
  const [keyword, setKeyword] = useState("");
  const { user } = useUserContext();

  const pinnedRooms = useFindUserRooms(user?.id, {
    pinned: true,
  });

  const allRooms = useFindUserRooms(user?.id, {
    pinned: !keyword ? false : undefined,
    keyword,
  });

  const uncontactedTutors = useFindUncontactedTutors(isStudent);

  const canLoadMore = useCallback(
    <T>(query: UseInfinitePaginationQueryResult<T>["query"]) =>
      query.hasNextPage && !query.isLoading && !query.isFetching,
    []
  );

  const update = useUpdateRoom({
    onSuccess() {
      pinnedRooms.query.refetch();
      allRooms.query.refetch();
    },
    onError(error) {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("chat.update-settings.error"),
        description: errorMessage,
      });
    },
  });

  return {
    rooms: {
      all: {
        list: allRooms.list,
        query: allRooms.query,
        more: allRooms.more,
        canLoadMore: canLoadMore(allRooms.query),
      },
      pinned: {
        query: pinnedRooms.query,
        list: pinnedRooms.list,
        more: pinnedRooms.more,
        canLoadMore: canLoadMore(pinnedRooms.query),
      },
      uncontactedTutors: {
        list: uncontactedTutors.list,
        query: uncontactedTutors.query,
        more: uncontactedTutors.more,
        canLoadMore: canLoadMore(uncontactedTutors.query),
      },
    },
    keyword: {
      value: keyword,
      set: setKeyword,
    },
    update: {
      toggleMute: ({ roomId, muted }: { roomId: number; muted: boolean }) =>
        update.mutate({ roomId, payload: { muted } }),
      togglePin: ({ roomId, pinned }: { roomId: number; pinned: boolean }) =>
        update.mutate({ roomId, payload: { pinned } }),
    },
  };
}

export function useNavigateToRoom() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<number[]>([]);
  const [lessonId, setLessonId] = useState(0);

  const findRoom = useFindRoomByMembers(members);

  const onSendMessage = useCallback((lessonId: number, members: number[]) => {
    setLessonId(lessonId);
    setMembers(members);
  }, []);

  useEffect(() => {
    const room = findRoom.data?.room;
    if (!room) return;
    setLessonId(0);
    navigate(`${Route.Chat}?room=${room}`);
  }, [navigate, setLessonId, findRoom.data?.room]);

  return useMemo(
    () => ({ lessonId, onSendMessage }),
    [lessonId, onSendMessage]
  );
}
