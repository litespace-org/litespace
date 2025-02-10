import React, { useCallback, useMemo } from "react";
import {
  asTutorRoomId,
  SelectedRoom,
  SelectRoom,
  UncontactedTutorRoomId,
} from "@litespace/ui/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import Search from "@litespace/assets/Search";
import Rooms from "@/components/Chat/Rooms";
import { useRoomManager } from "@/hooks/chat";
import { RoomsMap } from "@litespace/headless/chat";
import { isEmpty } from "lodash";
import { ITutor, IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";

const RoomsPanel: React.FC<{
  selectedRoom: number | UncontactedTutorRoomId | null;
  select: SelectRoom;
  typingMap: RoomsMap;
  onlineUsersMap: RoomsMap;
  setTemporaryTutor: (payload: ITutor.FullUncontactedTutorInfo | null) => void;
}> = ({
  select,
  setTemporaryTutor,
  typingMap,
  onlineUsersMap,
  selectedRoom,
}) => {
  const intl = useFormatMessage();
  const { user } = useUserContext();
  const isStudent = useMemo(
    () => !!user && user.role === IUser.Role.Student,
    [user]
  );
  const { rooms, keyword, update } = useRoomManager(isStudent);

  const selectTemporary = useCallback(
    (tutor: ITutor.FullUncontactedTutorInfo) => {
      setTemporaryTutor(tutor);
      select({ room: asTutorRoomId(tutor.id), otherMember: tutor });
    },
    [setTemporaryTutor, select]
  );

  const selectRoom = useCallback(
    ({ room, otherMember }: SelectedRoom) => {
      if (!select || !room || !otherMember) return;
      select({ room, otherMember });
      setTemporaryTutor(null);
      keyword.set("");
    },
    [select, setTemporaryTutor, keyword]
  );

  return (
    <div
      className={cn(
        "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-100",
        "flex-shrink-0 flex flex-col overflow-auto gap-6",
        "w-full lg:w-[400px] p-4 lg:p-6 border-e border-natural-200"
      )}
    >
      <div className="mb-6">
        <Typography
          weight="bold"
          element={{ default: "body", lg: "subtitle-2" }}
          className=" text-natural-950 mb-6"
        >
          {intl("chat.title")}
        </Typography>
        <Input
          id="search"
          placeholder={intl("chat.search")}
          value={keyword.value}
          onChange={(e) => keyword.set(e.target.value)}
          icon={<Search width={16} height={16} />}
        />
      </div>

      <div className="flex flex-col gap-6">
        {rooms.pinned.list && !isEmpty(rooms.pinned.list) && !keyword.value ? (
          <div className="mb-6">
            <Rooms
              type="pinned"
              onlineUsersMap={onlineUsersMap}
              typingMap={typingMap}
              toggleMute={update.toggleMute}
              togglePin={update.togglePin}
              data={rooms.pinned.list}
              select={selectRoom}
              pending={rooms.pinned.query.isPending}
              fetching={rooms.pinned.query.isFetching}
              error={rooms.pinned.query.isError}
              refetch={rooms.pinned.query.refetch}
              roomId={selectedRoom}
              more={rooms.pinned.more}
              canLoadMore={rooms.pinned.canLoadMore}
            />
          </div>
        ) : null}

        {rooms.all.list && !isEmpty(rooms.all.list) ? (
          <Rooms
            type="all"
            typingMap={typingMap}
            onlineUsersMap={onlineUsersMap}
            toggleMute={update.toggleMute}
            togglePin={update.togglePin}
            data={rooms.all.list}
            pending={rooms.all.query.isPending}
            fetching={rooms.all.query.isFetching}
            error={rooms.all.query.isError}
            refetch={rooms.all.query.refetch}
            select={selectRoom}
            roomId={selectedRoom}
            more={rooms.all.more}
            canLoadMore={rooms.all.canLoadMore}
          />
        ) : null}

        {user?.role === IUser.Role.Student &&
        rooms.uncontactedTutors.list &&
        !isEmpty(rooms.uncontactedTutors.list) ? (
          <Rooms
            type="uncontacted-tutors"
            selectUncontacted={selectTemporary}
            data={rooms.uncontactedTutors.list}
            pending={rooms.uncontactedTutors.query.isPending}
            fetching={rooms.uncontactedTutors.query.isFetching}
            refetch={rooms.uncontactedTutors.query.refetch}
            error={rooms.uncontactedTutors.query.isError}
            more={rooms.uncontactedTutors.more}
            canLoadMore={rooms.uncontactedTutors.canLoadMore}
            roomId={selectedRoom}
          />
        ) : null}
      </div>
    </div>
  );
};

export default RoomsPanel;
