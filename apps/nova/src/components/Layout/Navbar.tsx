import { useUserContext } from "@litespace/headless/context/user";
import {
  ProfileInfo,
  SearchInput,
  SubscriptionQuota,
} from "@litespace/luna/Navbar";
import React from "react";

const Navbar: React.FC = () => {
  const { user } = useUserContext();
  if (!user) return null;

  return (
    <div className=" shadow-app-navbar w-full z-navbar">
      <div className=" flex justify-between gap-8 items-center mx-auto  p-6 max-w-screen-3xl">
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
    </div>
  );
};

export default Navbar;
