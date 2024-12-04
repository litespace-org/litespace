import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import {
  ProfileInfo,
  SearchInput,
  SubscriptionQuota,
} from "@litespace/luna/Navbar";
import cn from "classnames";
import React from "react";

const Navbar: React.FC = () => {
  const user = useAppSelector(profileSelectors.user);
  if (!user) return null;

  return (
    <div
      className={cn(
        "flex justify-between gap-8 items-center px-6 pt-8 max-w-screen-3xl mx-auto w-full"
      )}
    >
      <SubscriptionQuota totalMinutes={1200} remainingMinutes={930} />
      <div className="w-[386px]">
        <SearchInput />
      </div>
      <ProfileInfo
        imageUrl={user.image}
        name={user.name}
        email={user.email}
        id={user.id}
      />
    </div>
  );
};

export default Navbar;
