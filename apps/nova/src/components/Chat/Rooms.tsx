import { ChatRoom } from "@litespace/luna/Chat";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { IRoom, Paginated } from "@litespace/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { asFullAssetUrl } from "@litespace/luna/backend";
import AllMessages from "@litespace/assets/AllMessages";
import Pin from "@litespace/assets/Pin";
import { useUserContext } from "@litespace/headless/context/user";
import { isOnline, isTyping, RoomsMap } from "@/lib/room";

type Query = UseInfiniteQueryResult<
  InfiniteData<Paginated<IRoom.FindUserRoomsApiRecord>, unknown>,
  Error
>;

const Rooms: React.FC<{
  type: "all" | "pinned";
  query: Query;
  rooms: IRoom.FindUserRoomsApiRecord[] | null;
  typingMap: RoomsMap;
  usersOnlineMap: RoomsMap;
  select: SelectRoom;
  roomId: number | null;
  target: React.RefObject<HTMLDivElement>;
  enabled: boolean;
  toggleMute: ({ roomId, muted }: { roomId: number; muted: boolean }) => void;
  togglePin: ({ roomId, pinned }: { roomId: number; pinned: boolean }) => void;
}> = ({
  typingMap,
  usersOnlineMap,
  query,
  rooms,
  select,
  target,
  roomId,
  type,
  enabled,
  toggleMute,
  togglePin,
}) => {
  const intl = useFormatMessage();
  const { user } = useUserContext();

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-row items-center justify-start gap-2 mb-4">
        {type === "all" ? <AllMessages /> : <Pin />}

        <Typography element="caption" className="text-natural-600">
          {type === "all" ? intl("chat.all") : intl("chat.pinned.title")}
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
              toggleMute({ roomId: room.roomId, muted: !room.settings.muted })
            }
            togglePin={() =>
              togglePin({
                roomId: room.roomId,
                pinned: !room.settings.pinned,
              })
            }
            image={
              room.otherMember.image
                ? asFullAssetUrl(room.otherMember.image)
                : undefined
            }
            name={room.otherMember.name!}
            // TODO: replace otherMember.name with member.bio
            message={
              room.latestMessage ? room.latestMessage?.text : "TODO: BIO"
            }
            unreadCount={room.unreadMessagesCount}
            isTyping={isTyping(typingMap, room.roomId, room.otherMember.id)}
            select={() =>
              select({
                room: room.roomId,
                otherMember: room.otherMember,
              })
            }
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
