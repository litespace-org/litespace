import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { useFindStudioTutor } from "@litespace/headless/tutor";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";

import Trash from "@litespace/assets/Trash";
import UploadImage from "@litespace/assets/UploadImage";

export const ThumbnailSection: React.FC<{
  tutorQuery: ReturnType<typeof useFindStudioTutor>;
  mutateAsset: ReturnType<typeof useUploadTutorAssets>;
  mutateUser: ReturnType<typeof useUpdateUser>;
  disabled?: boolean;
  onUpload?: (asset: File | undefined) => void;
}> = ({ tutorQuery, mutateAsset, mutateUser, disabled, onUpload }) => {
  const intl = useFormatMessage();
  const thumbnailInput = useRef<HTMLInputElement>(null);
  // NOTE: read the comments in AvatarCard.ts file for this state type explanation.
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined | null>(
    null
  );

  const thumbnail = useMemo(() => {
    if (thumbnailFile === undefined) return undefined;
    if (thumbnailFile === null) return tutorQuery.data?.thumbnail;
    if (typeof thumbnailFile === "string") return thumbnailFile;
    return URL.createObjectURL(thumbnailFile);
  }, [thumbnailFile, tutorQuery.data?.thumbnail]);

  const onUploadThumbnail = useCallback(() => {
    const thumbnail = thumbnailInput.current?.files?.item(0) || undefined;

    mutateAsset.mutation.mutateAsync({
      tutorId: tutorQuery.data?.id || 0,
      thumbnail,
    });

    setThumbnailFile(thumbnail);
    if (onUpload) onUpload(thumbnail);
  }, [mutateAsset.mutation, tutorQuery.data?.id, onUpload]);

  const onDeleteThumbnail = useCallback(() => {
    mutateUser.mutate(
      {
        id: tutorQuery.data?.id || 0,
        payload: {
          drop: { thumbnail: true },
        },
      },
      { onSuccess: () => setThumbnailFile(undefined) }
    );
  }, [tutorQuery.data?.id, mutateUser]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={thumbnailInput}
        onChange={onUploadThumbnail}
      />

      <div className="flex justify-between">
        <Typography tag="h2" className="text-subtitle-1 font-bold">
          {intl("dashboard.photo-session.label.thumbnail-image")}
        </Typography>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="large"
            onClick={() => thumbnailInput.current?.click()}
            disabled={disabled}
          >
            {intl("dashboard.photo-session.label.upload-image")}
          </Button>
          <Button
            type="error"
            size="large"
            variant="secondary"
            onClick={onDeleteThumbnail}
            endIcon={<Trash className="w-4 h-4 [&>*]:stroke-destructive-700" />}
            loading={mutateUser.isPending}
            disabled={disabled}
          />
        </div>
      </div>

      {thumbnail ? (
        <img
          src={thumbnail || undefined}
          className="self-center h-[559px] object-contain rounded-xl"
        />
      ) : null}

      {!thumbnail ? (
        <Button
          size="large"
          className="text-body font-medium self-center"
          endIcon={<UploadImage className="w-4 h-4 [&>*]:stroke-natural-50" />}
          onClick={() => thumbnailInput.current?.click()}
          disabled={disabled}
        >
          {intl("dashboard.photo-session.button.upload-image")}
        </Button>
      ) : null}
    </div>
  );
};
