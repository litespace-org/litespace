import React, { useMemo, useRef } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { first } from "lodash";
import { Avatar } from "@litespace/ui/Avatar";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";

const UploadPhoto: React.FC<{
  photo: File | string | null;
  setPhoto: (photo: File) => void;
  id: number;
  children: React.ReactNode;
}> = ({ photo, setPhoto, id, children }) => {
  const { lg } = useMediaQuery();
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);
  const mq = useMediaQuery();

  const photoUrl = useMemo(() => {
    if (!photo) return undefined;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  }, [photo]);

  return (
    <div className="flex gap-4 md:gap-6">
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
      <div className="grow md:grow-0 flex flex-col sm:flex-col-reverse justify-between lg:flex-col gap-2 lg:gap-4">
        <Typography
          element={lg ? "caption" : "tiny-text"}
          weight="semibold"
          className="text-natural-700 max-w-fit sm:max-w-[214px]"
        >
          {intl("settings.upload.image.desc")}
        </Typography>

        <div className="flex gap-2">
          <Button
            size={"large"}
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
              {mq.sm
                ? intl("settings.upload.image.label")
                : intl("settings.upload.image.label-sm")}
            </Typography>
          </Button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;
