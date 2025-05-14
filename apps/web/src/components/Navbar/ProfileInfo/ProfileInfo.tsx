import React, { useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { optional } from "@litespace/utils/utils";
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
    <div className="flex gap-2">
      <div className="w-6 h-6 md:w-[40px] md:h-[40px] rounded-full overflow-hidden">
        <AvatarV2 src={optional(imageUrl)} alt={optional(name)} id={id} />
      </div>
      {md ? (
        <div className="flex flex-col text-start gap-[1px]">
          <Typography
            tag="span"
            className="text-natural-950 text-caption font-semibold"
          >
            {name || backupName}
          </Typography>
          <Typography
            tag="span"
            className="text-natural-600 text-tiny font-normal"
          >
            {email}
          </Typography>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfo;
