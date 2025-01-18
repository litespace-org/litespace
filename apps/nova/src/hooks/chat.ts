import { IRoom, ITutor } from "@litespace/types";
import {
  useFindUncontactedTutors,
  useFindUserRooms,
  useUpdateRoom,
} from "@litespace/headless/chat";
import { useUserContext } from "@litespace/headless/context/user";
import { UseInfinitePaginationQueryResult } from "@litespace/headless/query";
import { useInfinteScroll } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { useCallback, useMemo, useState } from "react";

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

  const uncontactedTutors = useFindUncontactedTutors();

  const isEnabled = useCallback(
    (
      query: UseInfinitePaginationQueryResult<
        IRoom.FindUserRoomsApiRecord | ITutor.UncontactedTutorInfo
      >["query"]
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

  const uncontactedTutorsEnabled = useMemo(
    () => isEnabled(uncontactedTutors.query),
    [uncontactedTutors.query, isEnabled]
  );

  const { target: allRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    allRooms.more,
    allRoomsEnabled
  );

  const { target: pinnedRoomsTarget } = useInfinteScroll<HTMLDivElement>(
    pinnedRooms.more,
    pinnedRoomsEnabled
  );

  const { target: uncontactedTutorsTarget } = useInfinteScroll<HTMLDivElement>(
    uncontactedTutors.more,
    uncontactedTutorsEnabled
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
      uncontactedTutors: {
        list: uncontactedTutors.list,
        query: uncontactedTutors.query,
        target: uncontactedTutorsTarget,
        enabled: uncontactedTutorsEnabled,
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
