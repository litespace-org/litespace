import { useUserContext } from "@litespace/headless/context/user";
import {
  ProfileInfo,
  SearchInput,
  SubscriptionQuota,
} from "@litespace/luna/Navbar";
import React from "react";
import { useLocation } from "react-router-dom";
import cn from "classnames";
import { Route } from "@/types/routes";

const Navbar: React.FC = () => {
  const { user } = useUserContext();
  const location = useLocation();

  if (!user) return null;
  return (
    <div className="shadow-app-navbar w-full z-navbar">
      <div
        className={cn("flex justify-between gap-8 items-center p-6", {
          "max-w-screen-3xl mx-auto": location.pathname !== Route.Chat,
        })}
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
    </div>
  );
};

export default Navbar;
