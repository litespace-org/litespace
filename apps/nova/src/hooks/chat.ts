import { IRoom } from "@litespace/types";
import { useCallback, useMemo, useState } from "react";
import { useFindUserRooms, useUpdateRoom } from "@litespace/headless/chat";
import { UseInfinitePaginationQueryResult } from "@litespace/headless/query";
import { useInfinteScroll } from "@litespace/luna/hooks/common";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useUserContext } from "@litespace/headless/context/user";

export function useRoomManager() {
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

  const isEnabled = useCallback(
    (
      query: UseInfinitePaginationQueryResult<IRoom.FindUserRoomsApiRecord>["query"]
    ) => query.hasNextPage && !query.isLoading && !query.isFetching,
    []
  );

  const allRoomsEnabled = useMemo(
    () => isEnabled(allRooms.query),
    [allRooms.query, isEnabled]
  );

  const pinnedRoomsEnabled = useMemo(
    () => isEnabled(pinnedRooms.query),
    [pinnedRooms.query, isEnabled]
  );

  const { target: allRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    allRooms.more,
    allRoomsEnabled
  );

  const { target: pinnedRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    pinnedRooms.more,
    pinnedRoomsEnabled
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
        target: allRoomsTarget,
        enabled: allRoomsEnabled,
      },
      pinned: {
        query: pinnedRooms.query,
        list: pinnedRooms.list,
        target: pinnedRoomsTarget,
        enabled: pinnedRoomsEnabled,
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
