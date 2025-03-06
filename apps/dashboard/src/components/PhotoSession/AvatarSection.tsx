import { useCallback, useMemo, useRef, useState } from "react";

import { Avatar } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { useFindStudioTutor } from "@litespace/headless/tutor";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";

import Trash from "@litespace/assets/Trash";

export const AvatarSection: React.FC<{
  tutorQuery: ReturnType<typeof useFindStudioTutor>;
  mutateAsset: ReturnType<typeof useUploadTutorAssets>;
  mutateUser: ReturnType<typeof useUpdateUser>;
  disabled?: boolean;
  onUpload?: (asset: File | undefined) => void;
}> = ({ tutorQuery, mutateAsset, mutateUser, disabled, onUpload }) => {
  const intl = useFormatMessage();
  const avatarInput = useRef<HTMLInputElement>(null);
  // NOTE: this undefined | null union is mandatory for better UX;
  // the delete button sets the state to undefined to force reflecting
  // the effect on views. However the default value is null to allow
  // using the image link from the server in case it exists.
  const [avatarFile, setAvatarFile] = useState<File | undefined | null>(null);

  const avatar = useMemo(() => {
    if (avatarFile === undefined) return undefined;
    if (avatarFile === null) return tutorQuery.data?.image;
    if (typeof avatarFile === "string") return avatarFile;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile, tutorQuery.data?.image]);

  const onUploadAvatar = useCallback(() => {
    const image = avatarInput.current?.files?.item(0) || undefined;
    mutateAsset.mutation.mutateAsync({
      tutorId: tutorQuery.data?.id || 0,
      image,
    });
    setAvatarFile(image);
    if (onUpload) onUpload(image);
  }, [mutateAsset.mutation, tutorQuery.data?.id, onUpload]);

  const onDeleteAvatar = useCallback(() => {
    mutateUser.mutate(
      {
        id: tutorQuery.data?.id || 0,
        payload: {
          drop: { image: true },
        },
      },
      { onSuccess: () => setAvatarFile(undefined) }
    );
  }, [tutorQuery.data?.id, mutateUser]);

  return (
    <div className="flex w-full gap-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={avatarInput}
        onChange={onUploadAvatar}
      />

      <div className="w-[174px] h-auto rounded-full overflow-hidden">
        <Avatar src={avatar} />
      </div>

      <div className="flex flex-col gap-4 h-full">
        <Typography tag="span" className="text-h2 font-bold">
          {tutorQuery.data?.name}
        </Typography>

        <Typography tag="span" className="text-subtitle-2 font-semibold">
          {tutorQuery.data?.email}
        </Typography>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="large"
            onClick={() => avatarInput.current?.click()}
            disabled={disabled}
          >
            {intl("dashboard.photo-session.label.upload-image")}
          </Button>
          <Button
            type="error"
            size="large"
            variant="secondary"
            onClick={onDeleteAvatar}
            endIcon={<Trash className="w-4 h-4 [&>*]:stroke-destructive-700" />}
            loading={mutateUser.isPending}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
