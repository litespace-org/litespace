import { ChatRoom } from "@litespace/luna/Chat";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { IRoom, ITutor, Paginated } from "@litespace/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { asFullAssetUrl } from "@litespace/luna/backend";
import AllMessages from "@litespace/assets/AllMessages";
import Pin from "@litespace/assets/Pin";
import { useUserContext } from "@litespace/headless/context/user";
import { isOnline, isTyping } from "@/lib/room";
import { RoomsMap } from "@litespace/headless/chat";
import React, { useMemo } from "react";
import { LocalId } from "@litespace/luna/locales";
import People from "@litespace/assets/People";
import { orUndefined } from "@litespace/sol/utils";

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

  typingMap: RoomsMap;
  usersOnlineMap: RoomsMap;
  rooms?: IRoom.FindUserRoomsApiRecord[] | null;
  tutors?: ITutor.UncontactedTutorInfo[] | null;
  createRoom?: (tutor: ITutor.UncontactedTutorInfo) => void;
  select?: SelectRoom;
  roomId: number | null;
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
  tutors,
  createRoom,
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
        {rooms?.map((room) => (
          <ChatRoom
            key={room.roomId}
            isActive={room.roomId === roomId}
            optionsEnabled={!!room.latestMessage}
            // TODO: It will be replaced with the message State from the backend.
            messageState={undefined}
            owner={
              room.latestMessage ? room.latestMessage.userId === user.id : false
            }
            online={isOnline(usersOnlineMap, room.roomId, room.otherMember)}
            isPinned={room.settings.pinned}
            isMuted={room.settings.muted}
            userId={room.otherMember.id}
            toggleMute={() =>
              toggleMute &&
              toggleMute({ roomId: room.roomId, muted: !room.settings.muted })
            }
            togglePin={() =>
              togglePin &&
              togglePin({ roomId: room.roomId, pinned: !room.settings.pinned })
            }
            image={orUndefined(asFullAssetUrl(room.otherMember.image || ""))}
            name={room.otherMember.name!}
            // TODO: replace otherMember.name with member.bio
            message={
              room.latestMessage ? room.latestMessage?.text : "TODO: BIO"
            }
            unreadCount={room.unreadMessagesCount}
            isTyping={isTyping(typingMap, room.roomId, room.otherMember.id)}
            select={() =>
              select &&
              select({
                room: room.roomId,
                otherMember: room.otherMember,
              })
            }
          />
        ))}

        {tutors?.map((tutor) => (
          <ChatRoom
            key={tutor.id}
            optionsEnabled={false}
            userId={tutor.id}
            image={orUndefined(asFullAssetUrl(tutor.image || ""))}
            message={tutor.bio || ""}
            name={tutor.name || ""}
            unreadCount={0}
            select={() => createRoom && createRoom(tutor)}
            toggleMute={() => {}}
            togglePin={() => {}}
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
