import React, { useCallback, useMemo, useRef, useState } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { first } from "lodash";
import { AvatarV2 } from "@litespace/ui/Avatar";
import cn from "classnames";
import { useUpdateUser, useUploadUserImage } from "@litespace/headless/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useToast } from "@litespace/ui/Toast";
import { useOnError } from "@/hooks/error";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import Trash from "@litespace/assets/Trash";

const UploadPhoto: React.FC<{
  id: number;
  name: string | null;
  image: string | null;
}> = ({ id, name, image }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const toast = useToast();
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const { md } = useMediaQuery();
  const invalidateQuery = useInvalidateQuery();

  const { mutation: uploadUserImage } = useUploadUserImage({
    onSuccess() {
      invalidateQuery([QueryKey.FindCurrentUser]);
    },
  });

  const onClearPhotoSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    setPhoto(null);
  }, [invalidateQuery]);

  const onClearPhotoError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("student-settings.upload.image.clear.error"),
        description: intl(messageId),
      });
    },
  });
  const updateUserInfo = useUpdateUser({
    onSuccess: onClearPhotoSuccess,
    onError: onClearPhotoError,
  });

  const photoUrl = useMemo(() => {
    if (!photo) return image;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo, image]);

  return (
    <div className="flex gap-4 lg:gap-6">
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/gif,image/png"
        ref={ref}
        onChange={(event) => {
          const file = first(event.target.files);
          if (!file) return;
          setPhoto(file);
          uploadUserImage.reset();
          uploadUserImage.mutate({ image: file });
        }}
      />
      <div className="min-w-[84px] min-h-[84px] lg:w-[102px] lg:h-[102px] rounded-full overflow-hidden">
        <AvatarV2 src={photoUrl} alt={name} id={id} />
      </div>
      <div className="grow md:grow-0 flex flex-col justify-between gap-2 lg:gap-5">
        <Typography
          tag="span"
          className="text-natural-700 max-w-[214px] md:max-w-[240px] text-tiny lg:text-caption font-semibold md:font-normal lg:font-semibold"
        >
          {intl("student-settings.upload.image.desc")}
        </Typography>
        <div className="flex gap-2">
          <Button
            size="large"
            loading={uploadUserImage.isPending}
            disabled={uploadUserImage.isPending}
            onClick={() => {
              if (!ref.current) return;
              ref.current.click();
            }}
            className="w-fit text-body font-medium"
          >
            {intl("student-settings.upload.image.change")}
          </Button>

          <Button
            size="large"
            variant="secondary"
            type="error"
            loading={updateUserInfo.isPending}
            disabled={
              uploadUserImage.isPending ||
              updateUserInfo.isPending ||
              (!image && !photoUrl)
            }
            onClick={() => {
              updateUserInfo.mutate({ id, payload: { image: null } });
            }}
            className={cn(!image && !photoUrl && "hidden")}
            endIcon={!md ? <Trash className="icon w-4 h-4" /> : undefined}
          >
            {md ? (
              <Typography tag="p" className="text text-body font-medium">
                {intl("student-settings.upload.image.clear")}
              </Typography>
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;
