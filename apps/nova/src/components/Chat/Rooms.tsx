import { ChatRoom } from "@litespace/luna/Chat";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { IRoom, ITutor, Paginated } from "@litespace/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import AllMessages from "@litespace/assets/AllMessages";
import Pin from "@litespace/assets/Pin";
import { useUserContext } from "@litespace/headless/context/user";
import { isOnline, isTyping } from "@/lib/room";
import { RoomsMap } from "@litespace/headless/chat";
import React, { useMemo } from "react";
import { LocalId } from "@litespace/luna/locales";
import People from "@litespace/assets/People";
import { asChatRoomProps } from "@/lib/room";

type Query = UseInfiniteQueryResult<
  InfiniteData<
    Paginated<IRoom.FindUserRoomsApiRecord | ITutor.UncontactedTutorInfo>,
    unknown
  >,
  Error
>;

type RoomsData = {
  Icon: React.ReactNode;
  label: LocalId;
};

const Rooms: React.FC<{
  type: "all" | "pinned" | "uncontactedTutors";
  query: Query;
  typingMap?: RoomsMap;
  usersOnlineMap?: RoomsMap;
  rooms:
    | IRoom.FindUserRoomsApiRecord[]
    | ITutor.FullUncontactedTutorInfo[]
    | null;
  selectUncontacted?: (tutor: ITutor.FullUncontactedTutorInfo) => void;
  select?: SelectRoom;
  roomId: number | "temporary" | null;
  target: React.RefObject<HTMLDivElement>;
  enabled: boolean;
  toggleMute?: ({ roomId, muted }: { roomId: number; muted: boolean }) => void;
  togglePin?: ({ roomId, pinned }: { roomId: number; pinned: boolean }) => void;
}> = ({
  typingMap,
  usersOnlineMap,
  query,
  rooms,
  select,
  selectUncontacted,
  target,
  roomId,
  type,
  enabled,
  toggleMute,
  togglePin,
}) => {
  const intl = useFormatMessage();
  const { user } = useUserContext();

  const roomsData: RoomsData = useMemo(() => {
    if (type === "all")
      return {
        Icon: <AllMessages />,
        label: "chat.all",
      };
    if (type === "pinned")
      return {
        Icon: <Pin />,
        label: "chat.pinned.title",
      };

    return {
      Icon: <People className="[&>*]:stroke-natural-600" />,
      label: "chat.all-tutors.title",
    };
  }, [type]);

  /**
   * map from either unconctacted tutors or chatRooms to list of props
   * we are doing this to avoid making prop definition unread
   */
  const chatRoomProps: (React.ComponentProps<typeof ChatRoom> & {
    roomId: number | null;
  })[] = useMemo(
    () =>
      asChatRoomProps({
        roomId,
        rooms,
        selectUncontacted,
        currentUserId: user?.id,
        select,
        toggleMute,
        togglePin,
        intl,
      }),
    [
      rooms,
      selectUncontacted,
      roomId,
      select,
      toggleMute,
      togglePin,
      user?.id,
      intl,
    ]
  );

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-row items-center justify-start gap-2 mb-4">
        {roomsData.Icon}

        <Typography element="caption" className="text-natural-600">
          {intl(roomsData.label)}
        </Typography>
      </div>

      <div className="flex flex-col justify-stretch gap-4">
        {chatRoomProps.map((chatRoom) => (
          <ChatRoom
            {...chatRoom}
            online={isOnline({
              map: usersOnlineMap,
              roomId: chatRoom.roomId,
              otherMemberStatus: chatRoom.online,
              otherMemberId: chatRoom.userId,
            })}
            isTyping={isTyping({
              map: typingMap,
              roomId: chatRoom.roomId,
              otherMemberId: chatRoom.userId,
            })}
          />
        ))}
      </div>

      {query.isPending || query.isFetching ? (
        <div className="my-6">
          <Loader size="small" />
        </div>
      ) : null}

      <div
        data-enabled={enabled}
        className="data-[enabled=true]:h-2"
        ref={target}
      />

      {query.isError && !query.isPending ? (
        <div className="my-6 max-w-[192px] mx-auto">
          <LoadingError
            size="small"
            retry={() => query.refetch}
            error={intl("chat.error")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Rooms;
