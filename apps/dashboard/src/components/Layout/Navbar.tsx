import { AvatarV2 } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { getEmailUserName } from "@litespace/utils";
import React from "react";

const Navbar: React.FC<{
  id: number;
  image: string | null;
  name: string | null;
  email: string;
}> = ({ id, image, name, email }) => {
  return (
    <div className="p-6 bg-natural-50 shadow-app-navbar flex z-navbar w-full">
      <div className="max-w-screen-3xl mx-auto w-full flex">
        <div className="flex gap-2 mr-auto">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <AvatarV2 src={image} alt={name} id={id} />
          </div>
          <div className="flex flex-col justify-between">
            <Typography
              tag="h5"
              className="text-caption text-natural-950 font-semibold"
            >
              {name || getEmailUserName(email)}
            </Typography>
            <Typography
              tag="span"
              className="text-tiny font-normal text-natural-600"
            >
              {email}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
