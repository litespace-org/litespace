import React, { useRef } from "react";
import StudentDefaultAvatar from "@litespace/assets/StudentDefaultAvatar";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Typography } from "@litespace/luna/Typography";
import { first } from "lodash";

const UploadPhoto: React.FC<{
  photo: File | string | null;
  setPhoto: (photo: File) => void;
}> = ({ photo, setPhoto }) => {
  const intl = useFormatMessage();
  const ref = useRef<HTMLInputElement>(null);

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
      <div>
        {photo ? ( // todo: create avatar component
          <img
            className="rounded-full overflow-hidden w-[102px] h-[102px] object-contain"
            src={
              typeof photo === "string"
                ? "https://picsum.photos/300"
                : URL.createObjectURL(photo)
            }
          />
        ) : (
          <StudentDefaultAvatar />
        )}
      </div>
      <div className="flex flex-col gap-6">
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
          className="text-natural-700 max-w-56"
        >
          {intl("settings.upload.image.desc")}
        </Typography>
      </div>
    </div>
  );
};

export default UploadPhoto;
