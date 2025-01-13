import { useUserContext } from "@litespace/headless/context/user";
import {
  ProfileInfo,
  SearchInput,
  SubscriptionQuota,
} from "@litespace/luna/Navbar";
import cn from "classnames";
import React from "react";

const Navbar: React.FC = () => {
  const { user } = useUserContext();
  if (!user) return null;

  return (
    <div
      style={{
        boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
        zIndex: 1,
      }}
      className={cn(
        "flex justify-between gap-8 items-center p-6 max-w-screen-3xl mx-auto w-full"
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
