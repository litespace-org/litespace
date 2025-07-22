import { ISession, IUser } from "@litespace/types";
import React, { useEffect, useMemo, useState } from "react";
import Preview from "@/components/Session/Preview";
import { usePreview } from "@/components/Session/room";
import Controllers, { Controller } from "@/components/Session/Controllers";
import { supportsBackgroundProcessors } from "@livekit/track-processors";
import Ready from "@/components/Session/Ready";
import { useTracks } from "@livekit/components-react";
import { TrackReference } from "@/components/Session/types";
import { Dialogs, DialogTypes } from "@/components/Session/Dialogs";

const PreSession: React.FC<{
  type: ISession.Type;
  start: string;
  duration: number;
  localMemberId: number;
  localMemberRole: IUser.Role;
  localMemberName: string | null;
  localMemberImage: string | null;
  remoteMemberId: number;
  remoteMemberRole: IUser.Role;
}> = ({
  type,
  localMemberId,
  localMemberRole,
  localMemberName,
  localMemberImage,
  remoteMemberId,
  remoteMemberRole,
  start: sessionStart,
  duration: sessionDuration,
}) => {
  const tracks: TrackReference[] = useTracks();
  const {
    loading,
    error,
    success,
    start,
    join,
    videoRef,
    videoTrack,
    audioTrack,
    audioEnabled,
    videoEnabled,
    toggleBackgroundBlur,
    togglingBackgroundBlur,
    backgroundBlurEnabled,
  } = usePreview();

  const [dialog, setDialog] = useState<{
    visible: boolean;
    type: DialogTypes;
  }>({
    visible: false,
    type: "encourage-dialog",
  });

  const remoteMemberJoined = useMemo(() => {
    return !!tracks.find(
      (track) => track.participant.identity === remoteMemberId.toString()
    );
  }, [remoteMemberId, tracks]);

  useEffect(() => {
    if (loading || error || success) return;
    start();
  }, [error, loading, start, success]);

  const controllers = useMemo(() => {
    const audio: Controller = {
      toggle: () => {
        if (!audioTrack) return;
        // turning the mic off
        if (audioEnabled) {
          return audioTrack.mute();
        }
        // turning the mic on
        if (!audioEnabled) {
          if (!videoEnabled) {
            setDialog({
              type: "encourage-dialog",
              visible: true,
            });
          }
          return audioTrack.unmute();
        }
      },
      enabled: audioEnabled,
      error: !audioTrack,
    };

    const video: Controller = {
      toggle: () => {
        if (!videoTrack) return;
        // turning the cam off
        if (videoEnabled) {
          setDialog({
            type: "discourage-dialog",
            visible: true,
          });
          return videoTrack.mute();
        }
        // turning the cam on
        if (!videoEnabled) {
          return videoTrack.unmute();
        }
      },
      enabled: videoEnabled,
      error: !videoTrack,
    };

    const blur: Controller = {
      toggle: toggleBackgroundBlur,
      enabled: backgroundBlurEnabled,
      error: false,
      loading: togglingBackgroundBlur,
    };

    return {
      audio,
      video,
      blur: supportsBackgroundProcessors() && videoTrack ? blur : undefined,
    };
  }, [
    audioEnabled,
    audioTrack,
    backgroundBlurEnabled,
    toggleBackgroundBlur,
    togglingBackgroundBlur,
    videoEnabled,
    videoTrack,
  ]);

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:mt-28 max-h-full">
      {[IUser.Role.TutorManager, IUser.Role.Tutor].includes(localMemberRole) &&
      dialog.visible ? (
        <Dialogs
          type={dialog.type}
          setPermission={(perm) => {
            if (perm === "mic-only") {
              audioTrack?.unmute();
            } else if (perm === "cam-only") {
              videoTrack?.unmute();
            } else if (perm === "mic-and-camera") {
              audioTrack?.unmute();
              videoTrack?.unmute();
            }
          }}
          turnCamOff={() => videoTrack?.mute()}
          close={() => setDialog((prev) => ({ ...prev, visible: false }))}
        />
      ) : null}

      <div className="flex flex-col items-center justify-center gap-6 md:w-[480px] lg:w-[640px] h-full overflow-hidden">
        <div className="w-full max-h-[calc(100%-40px)] overflow-hidden aspect-mobile md:aspect-desktop">
          <Preview
            videoRef={videoRef}
            audio={audioEnabled}
            video={videoEnabled}
            userId={localMemberId}
            image={localMemberImage}
            name={localMemberName}
          />
        </div>

        <Controllers
          audio={controllers.audio}
          video={controllers.video}
          blur={controllers.blur}
        />
      </div>

      <div>
        <div className="md:h-[calc(100%-24px-40px)] flex items-center justify-center">
          <Ready
            type={type}
            start={sessionStart}
            duration={sessionDuration}
            join={join}
            disabled={!audioTrack && !videoTrack}
            remoteMember={{
              id: remoteMemberId,
              role: remoteMemberRole,
              // TODO: write the corret gender
              gender: IUser.Gender.Male,
              joined: remoteMemberJoined,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreSession;
