"use client";

import Lottie from "lottie-react";
import notifications from "@/animations/notifications.json";

export const Notifications: React.FC = () => {
  return (
    <Lottie
      animationData={notifications}
      name="Notifications"
      className="w-[215px] h-[200px] md:w-[317px] md:h-[295px] lg:w-[472px] lg:h-[440px]"
    />
  );
};
