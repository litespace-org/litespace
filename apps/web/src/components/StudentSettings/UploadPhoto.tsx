import React, { useMemo, useRef, useState } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { first } from "lodash";
import { Avatar } from "@litespace/ui/Avatar";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import { useUserContext } from "@litespace/headless/context/user";
import { orUndefined } from "@litespace/utils";
import { useUploadUserAssets } from "@litespace/headless/user";

const UploadPhoto: React.FC<{
  id: number;
}> = ({ id }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const { lg } = useMediaQuery();
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const mq = useMediaQuery();
  const { user } = useUserContext();

  const upload = useUploadUserAssets();

  const photoUrl = useMemo(() => {
    if (!photo) return user?.image;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo, user?.image]);

  return (
    <div className="flex gap-4 md:gap-6">
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/gif,image/png"
        ref={ref}
        disabled={!user}
        onChange={(event) => {
          const file = first(event.target.files);
          if (!file || !user) return;
          setPhoto(file);
          upload.mutate({
            id: user.id,
            payload: { image: file },
          });
        }}
      />
      <div className="min-w-[84px] min-h-[84px] lg:w-[102px] lg:h-[102px] rounded-full overflow-hidden">
        <Avatar
          src={orUndefined(photoUrl)}
          alt={orUndefined(user?.name)}
          seed={id.toString()}
        />
      </div>
      <div className="grow md:grow-0 flex flex-col sm:flex-col-reverse justify-between lg:flex-col gap-2 lg:gap-4">
        <Typography
          tag="span"
          className="text-natural-700 max-w-fit sm:max-w-[214px] text-tiny lg:text-caption font-semibold"
        >
          {intl("student-settings.upload.image.desc")}
        </Typography>

        <Button
          size="large"
          loading={upload.isPending}
          disabled={upload.isPending}
          onClick={() => {
            if (!ref.current) return;
            ref.current.click();
          }}
          className={cn("w-full", lg ? "max-w-fit" : "max-w-[214px]")}
        >
          <Typography
            tag="span"
            className="text-natural-50 text-caption font-semibold"
          >
            {mq.sm
              ? intl("student-settings.upload.image.label")
              : intl("student-settings.upload.image.label-sm")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

export default UploadPhoto;
