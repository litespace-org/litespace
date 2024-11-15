import React, { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { Drawer } from "@litespace/luna/Drawer";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { useRender } from "@litespace/luna/hooks/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import {
  // Mic,
  // MicOff,
  // Video,
  // VideoOff,
  // Monitor,
  MessageCircle,
  Phone,
  // Maximize,
  // Minimize,
} from "react-feather";
import { useParams } from "react-router-dom";
import cn from "classnames";
// import { useFullScreen } from "@/hooks/call";
// import Media from "@/components/Call/Media";
import Messages from "@/components/Chat/Messages";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { orNull } from "@litespace/sol/utils";
import {
  // useCall,
  useCallV2,
  useFindCallRoomById,
  usePeerIds,
} from "@litespace/headless/calls";
import { useDisplayRecorder } from "@litespace/headless/recorder";
import { isGhost } from "@/lib/ghost";
// import GhostView from "@/components/Call/GhostView";

const Call: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const chat = useRender();
  const intl = useFormatMessage();
  const mediaQueries = useMediaQueries();
  const { id } = useParams<{ id: string }>();
  // const { isFullScreen, toggleFullScreen, ref } = useFullScreen();

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const callRoom = useFindCallRoomById(!isGhost ? callId : null);

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

  // const { user, mate, start, onToggleCamera, onToggleMic, peer, ghostStreams } =
  //   useCall(
  //     useMemo(
  //       () => ({
  //         call: orUndefined(callId),
  //         mateUserId: mateInfo?.id,
  //         isGhost,
  //         userId: profile?.id,
  //       }),
  //       [callId, mateInfo?.id, profile?.id]
  //     )
  //   );

  const { start: startRecording } = useDisplayRecorder();

  // useEffect(() => {
  //   if (isGhost) return;
  //   start();
  // }, [start]);

  useEffect(() => {
    // if (isGhost) startRecording();
  }, [startRecording]);

  const onLeaveCall = useCallback(() => {
    // peer.destroy(); //! not correct!! Terminate the connection isntead
  }, []);

  // const findGhostPeerIdQuery = useMemo(():
  //   | IPeer.FindPeerIdApiQuery
  //   | undefined => {
  //   if (isGhost || !callId) return;
  //   return { type: IPeer.PeerType.Ghost, call: callId };
  // }, [callId]);

  // const findTutorPeerIdQuery = useMemo(():
  //   | IPeer.FindPeerIdApiQuery
  //   | undefined => {
  //   const allowed =
  //     profile?.role === IUser.Role.Student ||
  //     profile?.role === IUser.Role.Interviewer;
  //   if (isGhost || !mateInfo || !allowed) return;

  //   return { type: IPeer.PeerType.Tutor, tutor: mateInfo.id };
  // }, [mateInfo, profile]);

  // const ghostPeerId = useFindPeerId(findGhostPeerIdQuery);
  // const tutorPeerId = useFindPeerId(findTutorPeerIdQuery);

  const peers = usePeerIds(
    useMemo(
      () => ({
        callId,
        isGhost,
        mateUserId: orNull(mateInfo?.id),
        role: orNull(profile?.role),
      }),
      [callId, mateInfo?.id, profile?.role]
    )
  );

  useCallV2(
    useMemo(
      () => ({
        isGhost,
        ghostPeerId: orNull(peers.ghost.data),
        tutorPeerId: orNull(peers.tutor.data),
        userId: orNull(profile?.id),
      }),
      [peers.ghost.data, peers.tutor.data, profile?.id]
    )
  );

  console.log({ ghost: peers.ghost.data, tutor: peers.tutor.data });

  return (
    <div
      className={cn(
        "flex overflow-hidden w-full",
        isGhost ? "h-screen" : "h-[calc(100vh-4rem)]"
      )}
    >
      <div
        id="call-page"
        // ref={ref}
        className={cn(
          "flex flex-col w-full h-full",
          "transition-all duration-300 bg-dash-sidebar"
        )}
      >
        <div
          className={cn(
            "relative flex-1 w-full",
            isGhost ? "p-0" : "max-h-[calc(100%-110px)] pt-10 px-4"
          )}
        >
          {/* {isGhost ? (
            <GhostView streams={ghostStreams} />
          ) : (
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
          )} */}
        </div>
        {!isGhost ? (
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
                type={ButtonType.Main}
                variant={ButtonVariant.Secondary}
              >
                <MessageCircle />
              </Button>
            ) : null}
            {/* <Button
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize className="w-[20px] h-[20px]" />
            ) : (
              <Maximize className="w-[20px] h-[20px]" />
            )}
          </Button> */}
            {/* <Button
              onClick={
                user.streams.screen ? user.screen.stop : user.screen.share
              }
              loading={user.screen.loading}
              disabled={user.screen.loading}
              size={ButtonSize.Small}
              type={user.streams.screen ? ButtonType.Error : ButtonType.Main}
              variant={ButtonVariant.Secondary}
            >
              <Monitor className="w-[20px] h-[20px]" />
            </Button>

            <Button
              onClick={onToggleCamera}
              disabled={!user.camera}
              size={ButtonSize.Small}
              type={user.video ? ButtonType.Main : ButtonType.Error}
              variant={ButtonVariant.Secondary}
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
              type={user.audio ? ButtonType.Main : ButtonType.Error}
              variant={ButtonVariant.Secondary}
            >
              {user.audio ? (
                <Mic className="w-[20px] h-[20px]" />
              ) : (
                <MicOff className="w-[20px] h-[20px]" />
              )}
            </Button> */}
          </div>
        ) : null}
      </div>

      {!isGhost ? (
        <div
          className={cn(
            "hidden w-full lg:flex lg:flex-col lg:max-w-[350px] xl:max-w-[450px]"
          )}
        >
          {messages}
        </div>
      ) : null}

      <Drawer
        title={intl("global.labels.chat")}
        open={chat.open && !mediaQueries.lg && !isGhost}
        close={chat.hide}
      >
        {messages}
      </Drawer>
    </div>
  );
};

export default Call;
