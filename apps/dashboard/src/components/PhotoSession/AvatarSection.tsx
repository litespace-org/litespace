import { useMemo, useRef, useState } from "react";
import { Avatar } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";
import Trash from "@litespace/assets/Trash";
import { ITutor, Void } from "@litespace/types";
import { ConfirmDialog } from "./ConfirmDialog";
import VideoClip from "@litespace/assets/VideoClip";

export const AvatarSection: React.FC<{
  tutor?: ITutor.StudioTutorFields | null;
  refetch: Void;
}> = ({ tutor, refetch }) => {
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
    <div className="flex w-full gap-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={ref}
        onChange={(event) => {
          if (!tutor) return;
          const image = event.target.files?.item(0) || undefined;
          if (!image) return;
          setFile(image);
          upload.mutation.reset();
          upload.mutation.mutate({ tutorId: tutor.id, image });
        }}
      />

      <div className="w-[174px] h-[174px] rounded-full overflow-hidden">
        <Avatar
          key={tutor?.image}
          src={tutor?.image}
          alt={tutor?.name}
          seed={tutor?.id}
        />
      </div>

      <div className="flex flex-col gap-4 h-full">
        {tutor?.name ? (
          <Typography tag="span" className="text-h2 font-bold">
            {tutor.name}
          </Typography>
        ) : null}

        {tutor?.email ? (
          <Typography tag="span" className="text-subtitle-2 font-semibold">
            {tutor?.email}
          </Typography>
        ) : null}

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="large"
            onClick={() => ref.current?.click()}
            disabled={upload.mutation.isPending || update.isPending}
            loading={upload.mutation.isPending}
          >
            {intl("dashboard.photo-session.label.upload-image")}
          </Button>
          <Button
            type="error"
            size="large"
            variant="secondary"
            onClick={() => {
              if (!tutor) return;
              update.mutate({ id: tutor.id, payload: { image: null } });
            }}
            endIcon={<Trash className="icon" />}
            loading={update.isPending}
            disabled={
              upload.mutation.isPending || update.isPending || !tutor?.image
            }
          />
        </div>
      </div>

      {state ? (
        <ConfirmDialog
          title={intl(
            "dashboard.photo-session.confirmation-dialog.avatar-title"
          )}
          icon={<VideoClip />}
          onClose={() => {
            upload.mutation.reset();
          }}
          onTryAgain={() => {
            if (!tutor || !file) return;
            upload.mutation.reset();
            upload.mutation.mutate({ tutorId: tutor.id, image: file });
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
