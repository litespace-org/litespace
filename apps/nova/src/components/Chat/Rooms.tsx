import { ChatRoom } from "@litespace/luna/Chat";
import {
  asTutorRoomId,
  SelectRoom,
  UncontactedTutorRoomId,
} from "@litespace/luna/hooks/chat";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { IMessage, IRoom, ITutor, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import AllMessages from "@litespace/assets/AllMessages";
import Pin from "@litespace/assets/Pin";
import { useUserContext } from "@litespace/headless/context/user";
import { isOnline, isTyping } from "@/lib/room";
import { RoomsMap } from "@litespace/headless/chat";
import React, { useCallback, useMemo } from "react";
import { LocalId } from "@litespace/luna/locales";
import People from "@litespace/assets/People";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { orUndefined } from "@litespace/sol/utils";
import dayjs from "@/lib/dayjs";
import { InView } from "react-intersection-observer";

type RoomsData = {
  icon: React.ReactNode;
  label: LocalId;
};

const Rooms: React.FC<{
  type: "all" | "pinned" | "uncontacted-tutors";
  typingMap?: RoomsMap;
  onlineUsersMap?: RoomsMap;
  data: IRoom.FindUserRoomsApiRecord[] | ITutor.FullUncontactedTutorInfo[];
  selectUncontacted?: (tutor: ITutor.FullUncontactedTutorInfo) => void;
  select?: SelectRoom;
  roomId: number | UncontactedTutorRoomId | null;
  toggleMute?: (payload: { roomId: number; muted: boolean }) => void;
  togglePin?: (payload: { roomId: number; pinned: boolean }) => void;
  pending?: boolean;
  fetching?: boolean;
  error?: boolean;
  canLoadMore?: boolean;
  more: Void;
  refetch: Void;
}> = ({
  typingMap,
  onlineUsersMap,
  data,
  select,
  selectUncontacted,
  roomId,
  type,
  toggleMute,
  togglePin,
  pending,
  fetching,
  error,
  refetch,
  more,
  canLoadMore,
}) => {
  const intl = useFormatMessage();
  const { user } = useUserContext();

  const { icon, label }: RoomsData = useMemo(() => {
    if (type === "all")
      return {
        icon: <AllMessages className="w-4 h-4" />,
        label: "chat.all",
      };

    if (type === "pinned")
      return {
        icon: <Pin className="w-4 h-4" />,
        label: "chat.pinned.title",
      };

    return {
      icon: <People className="[&>*]:stroke-natural-600 w-4 h-4" />,
      label: "chat.all-tutors.title",
    };
  }, [type]);

  const asRoomMessage = useCallback(
    ({
      bio,
      online,
      message,
      lastSeen,
    }: {
      message: IMessage.Self | null;
      bio: string | null;
      lastSeen: string;
      online: boolean;
    }) => {
      if (message) return message.text;
      if (bio) return bio;
      if (online) return intl("chat.online");
      return intl("chat.offline", {
        time: dayjs(lastSeen).fromNow(),
      });
    },
    [intl]
  );

  const asMessageState = useCallback(
    (message: IMessage.Self | null): IMessage.MessageState | undefined => {
      if (!message) return;
      if (message.read) return "seen";
      return "sent";
    },
    []
  );

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-row items-center justify-start gap-2 mb-4">
        {icon}
        <Typography element="caption" className="text-natural-600">
          {intl(label)}
        </Typography>
      </div>

      <div className="flex flex-col justify-stretch gap-4">
        {data.map((data) => {
          const room = "roomId" in data;
          return (
            <ChatRoom
              key={room ? data.roomId : `t-${data.id}`}
              active={
                room
                  ? data.roomId === roomId
                  : asTutorRoomId(data.id) === roomId
              }
              actionable={type !== "uncontacted-tutors"}
              owner={room && data.latestMessage?.userId === user.id}
              pinned={room && data.settings.pinned}
              muted={room && data.settings.muted}
              userId={
                room
                  ? data.otherMember.id // other member id
                  : data.id // tutor id
              }
              imageUrl={orUndefined(
                asFullAssetUrl(room ? data.otherMember.image : data.image)
              )}
              name={orUndefined(room ? data.otherMember.name : data.name)}
              message={asRoomMessage({
                message: room ? data.latestMessage : null,
                bio: !room ? data.bio : null,
                lastSeen: room ? data.otherMember.lastSeen : data.lastSeen,
                online: room ? data.otherMember.online : data.online,
              })}
              unreadCount={room ? data.unreadMessagesCount : 0}
              messageState={asMessageState(room ? data.latestMessage : null)}
              select={() => {
                if (room && select)
                  return select({
                    room: data.roomId,
                    otherMember: data.otherMember,
                  });
                if (!room && selectUncontacted) return selectUncontacted(data);
              }}
              toggleMute={() => {
                if (!room || !toggleMute) return;
                toggleMute({
                  roomId: data.roomId,
                  muted: !data.settings.muted,
                });
              }}
              togglePin={() => {
                if (!room || !togglePin) return;
                togglePin({
                  roomId: data.roomId,
                  pinned: !data.settings.pinned,
                });
              }}
              online={isOnline({
                map: onlineUsersMap,
                roomId: room ? data.roomId : null,
                otherMemberStatus: room ? data.otherMember.online : data.online,
                otherMemberId: room ? data.otherMember.id : data.id,
              })}
              typing={isTyping({
                map: typingMap,
                roomId: room ? data.roomId : null,
                otherMemberId: room ? data.otherMember.id : data.id,
              })}
            />
          );
        })}
      </div>

      {pending || fetching ? (
        <div className="mt-6">
          <Loader size="small" />
        </div>
      ) : null}

      {canLoadMore && !pending && !error && !fetching ? (
        <InView
          onChange={(inview) => {
            if (inview) more();
          }}
        />
      ) : null}

      {error && !pending && !fetching ? (
        <div className="my-6 max-w-[192px] mx-auto">
          <LoadingError
            size="small"
            retry={refetch}
            error={intl("chat.error")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Rooms;
