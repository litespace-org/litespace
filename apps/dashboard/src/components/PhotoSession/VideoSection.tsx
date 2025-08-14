import { useMemo, useRef, useState } from "react";

import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";

import Trash from "@litespace/assets/Trash";
import Video from "@litespace/assets/VideoClip";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { Void } from "@litespace/types";
import { ConfirmDialog } from "@/components/PhotoSession/ConfirmDialog";
import VideoClip from "@litespace/assets/VideoClip";

export const VideoSection: React.FC<{
  tutorId: number | null;
  video: string | null;
  refetch: Void;
}> = ({ tutorId, video, refetch }) => {
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const update = useUpdateUser({
    onSuccess() {
      refetch();
    },
  });

  const upload = useUploadTutorAssets({
    onSuccess() {
      refetch();
    },
  });

  const state = useMemo(() => {
    if (upload.mutation.isPending) return "pending";
    if (upload.mutation.isError) return "error";
    if (upload.mutation.isSuccess) return "success";
    return null;
  }, [
    upload.mutation.isError,
    upload.mutation.isPending,
    upload.mutation.isSuccess,
  ]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        type="file"
        accept="video/*"
        className="hidden"
        ref={ref}
        onChange={(event) => {
          if (!tutorId) return;
          const video = event.target.files?.item(0) || undefined;
          if (!video) return;
          setFile(video);
          upload.mutation.reset();
          upload.mutation.mutate({ tutorId: tutorId, video });
        }}
      />

      <div className="flex justify-between">
        <Typography tag="h2" className="text-subtitle-1 font-bold">
          {intl("dashboard.photo-session.label.intro-video")}
        </Typography>
        {video ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="large"
              onClick={() => ref.current?.click()}
              disabled={!tutorId || upload.mutation.isPending}
            >
              {intl("dashboard.photo-session.label.upload-video")}
            </Button>
            <Button
              type="error"
              size="large"
              variant="secondary"
              onClick={() => {
                if (!tutorId) return;
                update.mutate({ id: tutorId, payload: { video: null } });
              }}
              endIcon={<Trash className="icon" />}
              loading={update.isPending}
              disabled={upload.mutation.isPending || update.isPending}
            />
          </div>
        ) : null}
      </div>

      {video ? <VideoPlayer src={video || undefined} /> : null}

      {!video ? (
        <Button
          size="large"
          className="text-body font-medium self-center"
          endIcon={<Video className="icon" />}
          onClick={() => ref.current?.click()}
          disabled={upload.mutation.isPending || update.isPending}
          loading={upload.mutation.isPending}
        >
          {intl("dashboard.photo-session.button.upload-video")}
        </Button>
      ) : null}

      {state ? (
        <ConfirmDialog
          title={intl(
            "dashboard.photo-session.confirmation-dialog.video-title"
          )}
          icon={<VideoClip />}
          onClose={() => {
            upload.mutation.reset();
          }}
          onTryAgain={() => {
            if (!tutorId || !file) return;
            upload.mutation.reset();
            upload.mutation.mutate({ tutorId: tutorId, video: file });
          }}
          progress={upload.progress}
          state={state}
          cancel={() => {
            upload.mutation.reset();
            upload.abort();
          }}
          open
        />
      ) : null}
    </div>
  );
};
