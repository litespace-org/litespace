import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { useFindStudioTutor } from "@litespace/headless/tutor";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";

import Trash from "@litespace/assets/Trash";
import Video from "@litespace/assets/VideoClip";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";

export const VideoSection: React.FC<{
  tutorQuery: ReturnType<typeof useFindStudioTutor>;
  mutateAsset: ReturnType<typeof useUploadTutorAssets>;
  mutateUser: ReturnType<typeof useUpdateUser>;
  disabled?: boolean;
  onUpload?: (asset: File | undefined) => void;
}> = ({ tutorQuery, mutateAsset, mutateUser, disabled, onUpload }) => {
  const intl = useFormatMessage();
  const videoInput = useRef<HTMLInputElement>(null);
  // NOTE: read the comments in AvatarCard.ts file for this state type explanation.
  const [videoFile, setVideoFile] = useState<File | undefined | null>(null);

  const video = useMemo(() => {
    if (videoFile === undefined) return undefined;
    if (videoFile === null) return tutorQuery.data?.video;
    if (typeof videoFile === "string") return videoFile;
    return URL.createObjectURL(videoFile);
  }, [videoFile, tutorQuery.data?.video]);

  const onUploadVideo = useCallback(() => {
    const video = videoInput.current?.files?.item(0) || undefined;
    mutateAsset.mutation.mutateAsync({
      tutorId: tutorQuery.data?.id || 0,
      video,
    });
    setVideoFile(video);
    if (onUpload) onUpload(video);
  }, [mutateAsset.mutation, tutorQuery.data?.id, onUpload]);

  const onDeleteVideo = useCallback(() => {
    mutateUser.mutate(
      {
        id: tutorQuery.data?.id || 0,
        payload: {
          drop: { video: true },
        },
      },
      { onSuccess: () => setVideoFile(undefined) }
    );
  }, [tutorQuery.data?.id, mutateUser]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        type="file"
        accept="video/*"
        className="hidden"
        ref={videoInput}
        onChange={onUploadVideo}
      />

      <div className="flex justify-between">
        <Typography tag="h2" className="text-subtitle-1 font-bold">
          {intl("dashboard.photo-session.label.intro-video")}
        </Typography>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="large"
            onClick={() => videoInput.current?.click()}
            disabled={disabled}
          >
            {intl("dashboard.photo-session.label.upload-video")}
          </Button>
          <Button
            type="error"
            size="large"
            variant="secondary"
            onClick={onDeleteVideo}
            endIcon={<Trash className="w-4 h-4 [&>*]:stroke-destructive-700" />}
            loading={mutateUser.isPending}
            disabled={disabled}
          />
        </div>
      </div>

      {video ? <VideoPlayer src={video || undefined} /> : null}

      {!video ? (
        <Button
          size="large"
          className="text-body font-medium self-center"
          endIcon={<Video className="w-4 h-4 [&>*]:stroke-natural-50" />}
          onClick={() => videoInput.current?.click()}
          disabled={disabled}
        >
          {intl("dashboard.photo-session.button.upload-video")}
        </Button>
      ) : null}
    </div>
  );
};
