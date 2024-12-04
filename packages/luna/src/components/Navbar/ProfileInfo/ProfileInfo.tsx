import React from "react";
import StudentDefaultAvatar from "@litespace/assets/StudentDefaultAvatar";
import { Typography } from "@/components/Typography";

const ProfileInfo: React.FC<{
  name: string;
  email: string;
  photo?: string | null;
}> = ({ name, email, photo }) => {
  return (
    <div className="tw-flex tw-gap-2">
      <div className="tw-w-[40px] tw-h-[40px]">
        {photo ? (
          <img
            className="tw-rounded-full tw-overflow-hidden tw-object-contain"
            src={
              typeof photo === "string"
                ? "https://picsum.photos/300"
                : URL.createObjectURL(photo)
            }
          />
        ) : (
          <StudentDefaultAvatar className="tw-w-full tw-overflow-hidden tw-object-cover" />
        )}
      </div>
      <div className="tw-flex tw-flex-col tw-gap-[1px]">
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950"
        >
          {name}
        </Typography>
        <Typography
          element="tiny-text"
          weight="regular"
          className="tw-text-natural-600"
        >
          {email}
        </Typography>
      </div>
    </div>
  );
};

export default ProfileInfo;
