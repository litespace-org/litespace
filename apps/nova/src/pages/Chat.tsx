import Messages from "@/components/Chat/Messages";
import RoomsContainer from "@/components/Chat/RoomsContainer";
import React, { useCallback } from "react";
import cn from "classnames";
import { useSelectedRoom } from "@litespace/luna/hooks/chat";
import { useFindRoomMembers } from "@litespace/headless/chat";
import { asOtherMember } from "@/lib/room";
import { useUserContext } from "@litespace/headless/context/user";

import StartMessaging from "@litespace/assets/StartMessaging";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Loader, LoadingError } from "@litespace/luna/Loading";

const Chat: React.FC = () => {
  const { user } = useUserContext();
  const intl = useFormatMessage();

  const { select, selected } = useSelectedRoom();
  // TODO: read/unread function
  const roomMembers = useFindRoomMembers(selected.room);
  const otherMember = asOtherMember(user?.id, roomMembers.data);

  const retry = useCallback(() => {
    roomMembers.refetch();
  }, [roomMembers]);

  if (roomMembers.isLoading)
    return (
      <div className="w-full h-full overflow-hidden flex flex-col gap-[157px] p-6">
        <Typography
          weight="bold"
          element="subtitle-2"
          className=" text-natural-950 mb-6"
        >
          {intl("chat.title")}
        </Typography>
        <div>
          <Loader size="large" text={intl("chat.loading")} />
        </div>
      </div>
    );

  if (roomMembers.isError)
    return (
      <div className="w-full h-full overflow-hidden flex flex-col gap-[157px] p-6">
        <Typography
          weight="bold"
          element="subtitle-2"
          className="text-natural-950 mb-6"
        >
          {intl("chat.title")}
        </Typography>
        <div>
          <LoadingError size="large" error={intl("chat.error")} retry={retry} />
        </div>
      </div>
    );

  return (
    <div className={cn("flex flex-row min-h-screen overflow-hidden")}>
      <RoomsContainer selected={selected} select={select} />

      {otherMember && selected.room ? (
        <Messages room={selected.room} otherMember={otherMember} />
      ) : null}
      {!selected.room ? (
        <div className="h-full w-full flex items-center justify-center flex-col gap-8">
          <StartMessaging />
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-natural-950 max-w-[496px] text-center"
          >
            {intl("chat.start-message")}
          </Typography>
        </div>
      ) : null}
    </div>
  );
};

export default Chat;
