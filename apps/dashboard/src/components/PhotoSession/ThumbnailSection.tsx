import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";
import Trash from "@litespace/assets/Trash";
import UploadImage from "@litespace/assets/UploadImage";
import { ConfirmDialog } from "@/components/PhotoSession/ConfirmDialog";
import VideoClip from "@litespace/assets/VideoClip";
import { Void } from "@litespace/types";
import { Loading } from "@litespace/ui/Loading";
import cn from "classnames";

export const ThumbnailSection: React.FC<{
  tutorId: number | null;
  thumbnail: string | null;
  refetch: Void;
}> = ({ tutorId, thumbnail, refetch }) => {
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    setLoading(!!thumbnail);
  }, [thumbnail]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={ref}
        onChange={(event) => {
          if (!tutorId) return;
          const thumbnail = event.target.files?.item(0) || undefined;
          if (!thumbnail) return;
          setFile(thumbnail);
          upload.mutation.reset();
          upload.mutation.mutate({ tutorId: tutorId, thumbnail });
        }}
      />

      <div className="flex justify-between">
        <Typography tag="h2" className="text-subtitle-1 font-bold">
          {intl("dashboard.photo-session.label.thumbnail-image")}
        </Typography>

        {thumbnail ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="large"
              onClick={() => ref.current?.click()}
              disabled={!tutorId || upload.mutation.isPending}
            >
              {intl("dashboard.photo-session.label.upload-image")}
            </Button>
            <Button
              type="error"
              size="large"
              variant="secondary"
              onClick={() => {
                if (!tutorId) return;
                update.mutate({ id: tutorId, payload: { thumbnail: null } });
              }}
              endIcon={
                <Trash className="w-4 h-4 [&>*]:stroke-destructive-700" />
              }
              loading={update.isPending}
              disabled={
                upload.mutation.isPending || update.isPending || !thumbnail
              }
            />
          </div>
        ) : null}
      </div>
      {thumbnail ? (
        <div className="bg-natural-100 rounded-xl overflow-hidden flex items-center justify-center py-3">
          <div className={cn("py-6", loading ? "opacity-100" : "opacity-0")}>
            <Loading />
          </div>

          <img
            onLoadCapture={() => {
              setLoading(false);
            }}
            src={thumbnail || undefined}
            className={cn(
              "object-contain transition-opacity duration-300",
              thumbnail && !loading ? "opacity-100 visible" : "opacity-0 hidden"
            )}
          />
        </div>
      ) : null}

      {!thumbnail ? (
        <Button
          size="large"
          className="text-body font-medium self-center"
          endIcon={<UploadImage className="icon" />}
          onClick={() => ref.current?.click()}
          disabled={upload.mutation.isPending || update.isPending}
          loading={upload.mutation.isPending}
        >
          {intl("dashboard.photo-session.button.upload-image")}
        </Button>
      ) : null}

      {state ? (
        <ConfirmDialog
          title={intl(
            "dashboard.photo-session.confirmation-dialog.thumbnail-title"
          )}
          icon={<VideoClip />}
          onClose={() => {
            upload.mutation.reset();
          }}
          onTryAgain={() => {
            if (!tutorId || !file) return;
            upload.mutation.reset();
            upload.mutation.mutate({ tutorId: tutorId, image: file });
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
