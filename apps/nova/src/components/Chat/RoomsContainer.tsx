import React, { useCallback } from "react";
import { SelectedRoom, SelectRoom } from "@litespace/luna/hooks/chat";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Input } from "@litespace/luna/Input";
import Search from "@litespace/assets/Search";
import Rooms from "@/components/Chat/Rooms";
import { HEADER_HEIGHT } from "@/constants/ui";
import { useRoomManager } from "@/hooks/chat";
import { RoomsMap } from "@litespace/headless/chat";
import { useCreateRoom } from "@litespace/headless/chat";
import { useToast } from "@litespace/luna/Toast";
import { isEmpty } from "lodash";
import { IRoom, ITutor, IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";

const RoomsContainer: React.FC<{
  selected: SelectedRoom;
  select: SelectRoom;
  typingMap: RoomsMap;
  usersOnlineMap: RoomsMap;
  setLoading: (loading: boolean) => void;
  setTemporaryTutor: (payload: ITutor.UncontactedTutorInfo | null) => void;
}> = ({
  select,
  setLoading,
  setTemporaryTutor,
  typingMap,
  usersOnlineMap,
  selected: { room: roomId },
}) => {
  const intl = useFormatMessage();

  const { user } = useUserContext();
  const toast = useToast();
  const { rooms, keyword, update } = useRoomManager();

  const onSuccess = useCallback(
    (response: IRoom.CreateRoomApiResponse) => {
      let selectedRoom: IRoom.FindUserRoomsApiRecord | null = null;
      rooms.all.query.refetch().then((res) => {
        res.data?.pages.forEach((page) => {
          const room = page.list.find(
            (room) => room.roomId === response.roomId
          );
          if (!room) return;
          selectedRoom = room;
        });
        if (!selectedRoom) return;
        setLoading(false);
        select({
          room: selectedRoom.roomId,
          otherMember: selectedRoom.otherMember,
        });
      });
      rooms.uncontactedTutors.query.refetch();
    },
    [rooms.all, rooms.uncontactedTutors, select, setLoading]
  );

  const onError = useCallback(() => {
    toast.error({
      title: intl("chat.create.room.error"),
    });
    setTemporaryTutor(null);
    setLoading(false);
  }, [toast, intl, setTemporaryTutor, setLoading]);

  const createRoom = useCreateRoom({ onSuccess, onError });

  const handleCreation = useCallback(
    (tutor: ITutor.UncontactedTutorInfo) => {
      setLoading(true);
      setTemporaryTutor(tutor);
      createRoom.mutate(tutor.id);
    },
    [createRoom, setLoading, setTemporaryTutor]
  );

  return (
    <div
      style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      className={cn(
        "flex flex-col overflow-auto h-screen gap-6",
        "w-[400px] border border-natural-200",
        "px-6 pt-8",
        "scrollbar-thin scrollbar-thumb-natural-200 scrollbar-track-natural-100"
      )}
    >
      <div>
        <div className="mb-6">
          <Typography
            weight="bold"
            element="subtitle-2"
            className=" text-natural-950 mb-6"
          >
            {intl("chat.title")}
          </Typography>
          <Input
            placeholder={intl("chat.search")}
            value={keyword.value}
            onChange={(e) => keyword.set(e.target.value)}
            startActions={[
              {
                id: 1,
                Icon: Search,
                onClick() {
                  alert("Clicked!");
                },
              },
            ]}
          />
        </div>

        {rooms.pinned.list && rooms.pinned.list.length > 0 && !keyword.value ? (
          <div className="mb-6">
            <Rooms
              usersOnlineMap={usersOnlineMap}
              typingMap={typingMap}
              toggleMute={update.toggleMute}
              togglePin={update.togglePin}
              type="pinned"
              query={rooms.pinned.query}
              rooms={rooms.pinned.list}
              target={rooms.pinned.target}
              select={select}
              roomId={roomId}
              enabled={rooms.pinned.enabled}
            />
          </div>
        ) : null}

        {!isEmpty(rooms.all.list) ? (
          <Rooms
            type="all"
            typingMap={typingMap}
            usersOnlineMap={usersOnlineMap}
            toggleMute={update.toggleMute}
            togglePin={update.togglePin}
            query={rooms.all.query}
            rooms={rooms.all.list}
            target={rooms.all.target}
            roomId={roomId}
            select={select}
            enabled={rooms.all.enabled}
          />
        ) : null}

        {user?.role === IUser.Role.Student ? (
          <Rooms
            type="uncontactedTutors"
            query={rooms.uncontactedTutors.query}
            tutors={rooms.uncontactedTutors.list}
            target={rooms.all.target}
            enabled={rooms.uncontactedTutors.enabled}
            createRoom={handleCreation}
            roomId={null}
          />
        ) : null}
      </div>
    </div>
  );
};

export default RoomsContainer;
