import React, { useMemo, useRef } from "react";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Typography } from "@litespace/luna/Typography";
import { first } from "lodash";
import { Avatar } from "@litespace/luna/Avatar";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";

const UploadPhoto: React.FC<{
  photo: File | string | null;
  setPhoto: (photo: File) => void;
  id: number;
}> = ({ photo, setPhoto, id }) => {
  const { lg } = useMediaQuery();
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);

  const photoUrl = useMemo(() => {
    if (!photo) return undefined;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo]);

  return (
    <div className="flex gap-[30px] md:gap-6">
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/gif,image/png"
        ref={ref}
        onChange={(event) => {
          const file = first(event.target.files);
          if (!file) return;
          setPhoto(file);
        }}
      />

      <div className="min-w-[84px] min-h-[84px] lg:w-[102px] lg:h-[102px] rounded-full overflow-hidden">
        <Avatar src={photoUrl} alt={photoUrl} seed={id.toString()} />
      </div>
      <div className="grow md:grow-0 flex flex-col-reverse lg:flex-col gap-2 lg:gap-4">
        <Button
          size={ButtonSize.Tiny}
          onClick={() => {
            if (!ref.current) return;
            ref.current.click();
          }}
          className={cn("w-full", lg ? "max-w-fit" : "max-w-[214px]")}
        >
          <Typography
            element="caption"
            weight="semibold"
            className="text-natural-50"
          >
            {intl("settings.upload.image.label")}
          </Typography>
        </Button>
        <Typography
          element={lg ? "caption" : "tiny-text"}
          weight="semibold"
          className="text-natural-700 max-w-fit lg:max-w-[214px]"
        >
          {intl("settings.upload.image.desc")}
        </Typography>
      </div>
    </div>
  );
};

export default UploadPhoto;
