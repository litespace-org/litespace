import {
  ProfileInfo,
  SearchInput,
  SubscriptionQuota,
} from "@litespace/luna/Navbar";
import { IUser } from "@litespace/types";
import cn from "classnames";
import React from "react";

const Navbar: React.FC<{ user: IUser.Self; className: string }> = ({
  user,
  className,
}) => {
  if (!user || !user.name) return null;

  return (
    <div className={cn("flex justify-between gap-8 items-center", className)}>
      {/* TODO: format the rest of the quota after adding plans to the user */}
      <SubscriptionQuota percent={88} rest={4} />
      <SearchInput />
      <ProfileInfo photo={user.image} username={user.name} email={user.email} />
    </div>
  );
};

export default Navbar;
