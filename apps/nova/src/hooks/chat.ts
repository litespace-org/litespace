import {
  useFindUncontactedTutors,
  useFindUserRooms,
  useUpdateRoom,
} from "@litespace/headless/chat";
import { useUserContext } from "@litespace/headless/context/user";
import { UseInfinitePaginationQueryResult } from "@litespace/headless/query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { useCallback, useState } from "react";

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
    onError() {
      toast.error({ title: intl("chat.update-settings.error") });
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
