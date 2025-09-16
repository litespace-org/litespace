import Edit from "@litespace/assets/Edit";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUploadUserImage } from "@litespace/headless/user";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { first } from "lodash";
import React, { useMemo, useRef, useState } from "react";

const MobileUploadPhoto: React.FC<{
  id: number;
  name: string | null;
  image: string | null;
  email: string;
}> = ({ id, name, image, email }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const invalidateQuery = useInvalidateQuery();

  const { mutation: uploadUserImage } = useUploadUserImage({
    onSuccess() {
      invalidateQuery([QueryKey.FindCurrentUser]);
    },
  });

  const photoUrl = useMemo(() => {
    if (!photo) return image;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo, image]);

  return (
    <div className="flex flex-col items-center lg:gap-6">
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
      <div className="relative w-[80px] h-[80px] mb-4">
        <div className="rounded-full overflow-hidden w-full h-full">
          <AvatarV2 src={photoUrl} alt={name} id={id} />
        </div>
        <div className="absolute -bottom-[6px] -right-2 z-50 ">
          <Button
            variant="secondary"
            type="natural"
            loading={uploadUserImage.isPending}
            disabled={uploadUserImage.isPending}
            startIcon={<Edit className="icon [&>*]:stroke-[1.4px]" />}
            onClick={() => {
              if (!ref.current) return;
              ref.current.click();
            }}
            className="w-fit text-body font-medium !border-none !bg-transparent"
          />
        </div>
      </div>
      <div className="grow md:grow-0 flex flex-col justify-between gap-1 lg:gap-5">
        <Typography
          tag="p"
          className="text-natural-700 text-caption font-bold text-center"
        >
          {name}
        </Typography>
        <Typography
          tag="p"
          className="text-natural-800 text-caption text-center"
        >
          {email}
        </Typography>
      </div>
    </div>
  );
};

export default MobileUploadPhoto;
