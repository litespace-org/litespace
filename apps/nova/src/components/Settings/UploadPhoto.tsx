import React, { useMemo, useRef } from "react";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Typography } from "@litespace/luna/Typography";
import { first } from "lodash";
import { Avatar } from "@litespace/luna/Avatar";
import { asFullAssetUrl } from "@litespace/luna/backend";

const UploadPhoto: React.FC<{
  photo: File | string | null;
  setPhoto: (photo: File) => void;
  id: number;
}> = ({ photo, setPhoto, id }) => {
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);

  const photoUrl = useMemo(() => {
    if (!photo) return undefined;
    if (typeof photo === "string") return asFullAssetUrl.of(photo);
    return URL.createObjectURL(photo);
  }, [photo]);

  return (
    <div className="flex flex-row gap-6">
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

      <div className="w-[102px] h-[102px] rounded-full overflow-hidden">
        <Avatar src={photoUrl} alt={photoUrl} seed={id.toString()} />
      </div>
      <div className="flex flex-col gap-4">
        <Button
          size={ButtonSize.Tiny}
          onClick={() => {
            if (!ref.current) return;
            ref.current.click();
          }}
        >
          {intl("settings.upload.image.label")}
        </Button>
        <Typography
          element="caption"
          weight="semibold"
          className="text-natural-700 max-w-[214px]"
        >
          {intl("settings.upload.image.desc")}
        </Typography>
      </div>
    </div>
  );
};

export default UploadPhoto;
