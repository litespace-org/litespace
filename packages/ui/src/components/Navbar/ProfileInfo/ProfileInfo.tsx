import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const ProfileInfo: React.FC<{
  id: number;
  name: string | null;
  email: string;
  imageUrl: string | null;
}> = ({ id, name, email, imageUrl }) => {
  const { md } = useMediaQuery();
  const backupName = useMemo(() => {
    const [prefix] = email.split("@");
    return prefix || "-";
  }, [email]);

  return (
    <div className="tw-flex tw-gap-2">
      <div className="tw-w-6 tw-h-6 md:tw-w-[40px] md:tw-h-[40px] tw-rounded-full tw-overflow-hidden">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      {md ? (
        <div className="tw-flex tw-flex-col tw-gap-[1px]">
          <Typography
            element="caption"
            weight="semibold"
            className="tw-text-natural-950"
          >
            {name || backupName}
          </Typography>
          <Typography
            element="tiny-text"
            weight="regular"
            className="tw-text-natural-600"
          >
            {email}
          </Typography>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfo;
