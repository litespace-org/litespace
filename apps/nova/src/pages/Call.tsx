import React, { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
// import { Drawer } from "@litespace/luna/Drawer";
// import { useMediaQueries } from "@litespace/luna/hooks/media";
// import { useRender } from "@litespace/luna/hooks/common";
// import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useParams } from "react-router-dom";
import cn from "classnames";
// import { useFullScreen } from "@/hooks/call";
// import Media from "@/components/Call/Media";
// import Messages from "@/components/Chat/Messages";
import { orNull, orUndefined } from "@litespace/sol/utils";
import {
  useCallMembers,
  // useCall,
  useCallV2,
  useFindCallRoomById,
  useFullScreen,
  usePeerIds,
} from "@litespace/headless/calls";
import { useDisplayRecorder } from "@litespace/headless/recorder";
import { isGhost } from "@/lib/ghost";
import CallView, { CallViewProps } from "@/components/Call/CallView";
import CallIncoming from "@litespace/assets/CallIncoming";
import Monitor from "@litespace/assets/Monitor";
import Video from "@litespace/assets/Video";
import Microphone from "@litespace/assets/Microphone";
import VideoSlash from "@litespace/assets/VideoSlash";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import { ICall } from "@litespace/types";
import { useUser } from "@litespace/headless/context/user";
// import GhostView from "@/components/Call/GhostView";

const Call: React.FC = () => {
  const { user } = useUser();
  // const chat = useRender();
  // const intl = useFormatMessage();
  // const mediaQueries = useMediaQueries();
  const { id, type } = useParams<{ id: string; type: ICall.Type }>();
  // const { isFullScreen, toggleFullScreen, ref } = useFullScreen();

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const ctype = useMemo(() => {
    if (type != "lesson" && type != "interview") return null;
    return type;
  }, [type]);

  const callRoom = useFindCallRoomById(!isGhost ? callId : null);

  const mateInfo = useMemo(() => {
    if (!callRoom.data) return;
    return callRoom.data.members.find((member) => member.id !== user?.id);
  }, [callRoom.data, user?.id]);

  const members = useCallMembers(callId, ctype);
  useEffect(() => console.log("In App members: ", members), [members]);

  // const messages = useMemo(
  //   () =>
  //     callRoom.data ? (
  //       <Messages room={callRoom.data.room} members={callRoom.data.members} />
  //     ) : null,
  //   [callRoom.data]
  // );

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

  const fullScreen = useFullScreen<HTMLDivElement>();

  const peers = usePeerIds(
    useMemo(
      () => ({
        callId,
        isGhost,
        mateUserId: orNull(mateInfo?.id),
        role: orNull(user?.role),
        disableGhost: false,
      }),
      [callId, mateInfo?.id, user?.role]
    )
  );

  const onCloseCall = useCallback(() => {
    // peers.ghost.refetch();
    // peers.tutor.refetch();
  }, []);

  /*
  console.log({
    fetching: peers.ghost.isFetching,
    isPending: peers.ghost.isPending,
    isLoading: peers.ghost.isLoading,
    ghost: peers.ghost.data,
    tutor: peers.tutor.data,
  });
  */

  const { userMedia, mateStream, mateScreenStream, ghostStreams } = useCallV2(
    useMemo(
      () => ({
        isGhost,
        ghostPeerId: orNull(peers.ghost.data),
        tutorPeerId: orNull(peers.tutor.data),
        userId: orNull(user?.id),
        onCloseCall,
      }),
      [onCloseCall, peers.ghost.data, peers.tutor.data, user?.id]
    )
  );

  useEffect(() => console.log({ ghostStreams }), [ghostStreams]);

  const callViewProps: CallViewProps = useMemo(
    () => ({
      user: {
        streams: {
          self: userMedia.stream,
          screen: null,
        },
        speaking: true,
        name: orUndefined(user?.name),
      },
      mate: {
        streams: {
          self: mateStream,
          screen: mateScreenStream,
        },
        speaking: true,
        name: orUndefined(mateInfo?.name),
      },
      fullScreen: {
        enabled: fullScreen.enabled,
        start: fullScreen.start,
        exit: fullScreen.exit,
      },
    }),
    [
      fullScreen.enabled,
      fullScreen.exit,
      fullScreen.start,
      mateInfo?.name,
      mateScreenStream,
      mateStream,
      user?.name,
      userMedia.stream,
    ]
  );

  return (
    <div
      ref={fullScreen.ref}
      className={cn(
        "flex overflow-hidden w-full h-screen max-w-screen-lg mx-auto bg-natural-50"
      )}
    >
      <div
        id="call-page"
        className={cn(
          "flex flex-col w-full h-full",
          "transition-all duration-300"
        )}
      >
        <div
          className={cn(
            "relative flex-1 w-full mb-10",
            fullScreen.enabled ? "mb-0" : "mb-10"
            // isGhost ? "p-0" : "max-h-[calc(100%-110px)] pt-10 px-4"
          )}
        >
          <CallView {...callViewProps} />
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

        {!fullScreen.enabled ? (
          <div className="h-[1px] w-full bg-natural-400" />
        ) : null}

        {!isGhost ? (
          <div
            className={cn(
              "flex items-center justify-center gap-6 mb-12",
              fullScreen.enabled ? "mt-6" : "mt-10"
            )}
          >
            <Button
              onClick={onLeaveCall}
              size={ButtonSize.Small}
              type={ButtonType.Error}
              variant={ButtonVariant.Secondary}
            >
              <CallIncoming className="[&_*]:stroke-destructive-700" />
            </Button>

            <Button
              onClick={() => alert("todo")}
              size={ButtonSize.Small}
              type={ButtonType.Success}
              variant={ButtonVariant.Secondary}
            >
              <Monitor className="[&_*]:stroke-brand-700" />
            </Button>

            <Button
              onClick={userMedia.toggleCamera}
              size={ButtonSize.Small}
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
            >
              {userMedia.video ? (
                <Video className="[&_*]:stroke-brand-700" />
              ) : (
                <VideoSlash className="[&_*]:stroke-brand-700" />
              )}
            </Button>

            <Button
              onClick={userMedia.toggleMic}
              size={ButtonSize.Small}
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
            >
              {userMedia.audio ? (
                <Microphone className="[&_*]:stroke-brand-700" />
              ) : (
                <MicrophoneSlash className="[&_*]:stroke-brand-700" />
              )}
            </Button>

            {
              /*
               * TODO: replace this by members views
               */
              <div>
                <h1>Joined members</h1>
                {members.map((m) => (
                  <label className="mx-1">-{m}-</label>
                ))}
              </div>
            }

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

      {/* {!isGhost ? (
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
      </Drawer> */}
    </div>
  );
};

export default Call;
