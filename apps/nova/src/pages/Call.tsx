import React, { useCallback, useEffect, useMemo } from "react";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Drawer } from "@litespace/luna/Drawer";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { useRender } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageCircle,
  Phone,
  Maximize,
  Minimize,
} from "react-feather";
import { useParams } from "react-router-dom";
import cn from "classnames";
import { useFullScreen } from "@/hooks/call";
import Media from "@/components/Call/Media";
import Messages from "@/components/Chat/Messages";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { orUndefined } from "@litespace/sol/utils";
import { useCall, useFindCallRoomById } from "@litespace/headless/calls";

const Call: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const chat = useRender();
  const intl = useFormatMessage();
  const mediaQueries = useMediaQueries();
  const { id } = useParams<{ id: string }>();
  const { isFullScreen, toggleFullScreen, ref } = useFullScreen();

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const callRoom = useFindCallRoomById(callId);

  const mateInfo = useMemo(() => {
    if (!callRoom.data) return;
    return callRoom.data.members.find((member) => member.id !== profile?.id);
  }, [callRoom.data, profile?.id]);

  const messages = useMemo(
    () =>
      callRoom.data ? (
        <Messages room={callRoom.data.room} members={callRoom.data.members} />
      ) : null,
    [callRoom.data]
  );

  const { user, mate, start, onToggleCamera, onToggleMic, peer } = useCall(
    callId,
    mateInfo?.id || null
  );

  useEffect(() => {
    start();
  }, [start]);

  const onLeaveCall = useCallback(() => {
    peer.destroy();
  }, [peer]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div
        id="call-page"
        ref={ref}
        className={cn(
          "flex flex-col w-full h-full",
          "transition-all duration-300 bg-dash-sidebar"
        )}
      >
        <div
          className={cn(
            "relative flex-1 w-full max-h-[calc(100%-110px)] pt-10 px-4"
          )}
        >
          <Media
            userMediaStream={user.streams.self}
            remoteMediaStream={mate.streams.self}
            userScreenStream={user.streams.screen}
            remoteScreenStream={mate.streams.screen}
            userName={orUndefined(profile?.name)}
            mateName={orUndefined(mateInfo?.name)}
            userImage={orUndefined(profile?.image)}
            mateImage={orUndefined(mateInfo?.image)}
            loadingUserStream={user.loading}
            userSpeaking={user.speaking}
            mateSpeaking={mate.speaking}
            userVideo={user.video}
            userAudio={user.audio}
            mateVideo={mate.video}
            mateAudio={mate.audio}
            userDenided={user.denied}
          />
        </div>
        <div className="flex items-center justify-center gap-4 my-10">
          <Button
            onClick={onLeaveCall}
            size={ButtonSize.Small}
            type={ButtonType.Error}
          >
            <Phone className="w-[20px] h-[20px]" />
          </Button>

          {!mediaQueries.lg ? (
            <Button
              onClick={chat.show}
              size={ButtonSize.Small}
              type={ButtonType.Secondary}
            >
              <MessageCircle />
            </Button>
          ) : null}
          <Button
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize className="w-[20px] h-[20px]" />
            ) : (
              <Maximize className="w-[20px] h-[20px]" />
            )}
          </Button>
          <Button
            onClick={user.streams.screen ? user.screen.stop : user.screen.share}
            loading={user.screen.loading}
            disabled={user.screen.loading}
            size={ButtonSize.Small}
            type={user.streams.screen ? ButtonType.Error : ButtonType.Secondary}
          >
            <Monitor className="w-[20px] h-[20px]" />
          </Button>

          <Button
            onClick={onToggleCamera}
            disabled={!user.camera}
            size={ButtonSize.Small}
            type={user.video ? ButtonType.Secondary : ButtonType.Error}
          >
            {user.video ? (
              <Video className="w-[20px] h-[20px]" />
            ) : (
              <VideoOff className="w-[20px] h-[20px]" />
            )}
          </Button>

          <Button
            onClick={onToggleMic}
            disabled={!user.mic}
            size={ButtonSize.Small}
            type={user.audio ? ButtonType.Secondary : ButtonType.Error}
          >
            {user.audio ? (
              <Mic className="w-[20px] h-[20px]" />
            ) : (
              <MicOff className="w-[20px] h-[20px]" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "hidden w-full lg:flex lg:flex-col lg:max-w-[350px] xl:max-w-[450px]"
        )}
      >
        {messages}
      </div>

      <Drawer
        title={intl("global.labels.chat")}
        open={chat.open && !mediaQueries.lg}
        close={chat.hide}
      >
        {messages}
      </Drawer>
    </div>
  );
};

export default Call;
