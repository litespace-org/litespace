import { ChatItem } from "@litespace/luna/Chat";
import { SelectRoom } from "@litespace/luna/hooks/chat";
import { Loading } from "@litespace/luna/Loading";
import { Typography } from "@litespace/luna/Typography";
import { IRoom, Paginated, Void } from "@litespace/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import cn from "classnames";

type Query = UseInfiniteQueryResult<
  InfiniteData<Paginated<IRoom.FindUserRoomsApiRecord>, unknown>,
  Error
>;

const Rooms: React.FC<{
  type: "all" | "pinned";
  title: string;
  query: Query;
  rooms: IRoom.FindUserRoomsApiRecord[] | null;
  select: SelectRoom;
  refetch: Void;
  roomId: number | null;
  target: React.RefObject<HTMLDivElement>;
  Icon: React.ReactNode;
}> = ({ query, rooms, select, refetch, target, roomId, title, Icon, type }) => {
  return (
    <div className="mt-6">
      <Typography className="flex items-center text-sm text-natural-600 gap-[2.5px]">
        {Icon}
        {title}
      </Typography>
      {query.isFetching || query.isLoading ? (
        <Loading
          className={cn("shrink-0", {
            "h-full": query.isLoading,
            "h-10": query.isFetching,
          })}
        />
      ) : (
        <div className="flex flex-col justify-stretch mt-4">
          {rooms
            ?.filter((r) =>
              type === "pinned" ? r.settings.pinned : !r.settings.pinned
            )
            .map((room) => (
              <ChatItem
                key={room.roomId}
                isActive={room.roomId === roomId}
                isPinned={room.settings.pinned}
                isMuted={room.settings.muted}
                roomId={room.roomId}
                image={room.otherMember.image!}
                name={room.otherMember.name!}
                message={room.latestMessage?.text || ""}
                unreadCount={room.unreadMessagesCount}
                isTyping={false}
                select={() =>
                  select({
                    room: room.roomId,
                    otherMember: room.otherMember,
                  })
                }
                refetch={refetch}
              />
            ))}
          <div ref={target} />
        </div>
      )}
    </div>
  );
};

export default Rooms;
