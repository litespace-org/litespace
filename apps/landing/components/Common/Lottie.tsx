"use client";

import Lottie from "lottie-react";
import notifications from "@/animations/notifications.json";
import anytime from "@/animations/anytime.json";
import novelity from "@/animations/novelity.json";
import timeIsYours from "@/animations/time-is-yours.json";

export const Notifications: React.FC = () => {
  return (
    <Lottie
      animationData={notifications}
      name="Notifications"
      className="w-[215px] h-[200px] md:w-[317px] md:h-[295px] lg:w-[472px] lg:h-[440px]"
    />
  );
};

export const AnyTime: React.FC = () => {
  return (
    <Lottie
      animationData={anytime}
      name="Any Time"
      className="w-[215px] h-[200px] md:w-[317px] md:h-[295px] lg:w-[472px] lg:h-[440px]"
    />
  );
};

export const Novelity: React.FC = () => {
  return (
    <Lottie
      animationData={novelity}
      name="Novelity"
      className="w-[215px] h-[200px] md:w-[317px] md:h-[295px] lg:w-[472px] lg:h-[440px]"
    />
  );
};

export const TimeIsYours: React.FC = () => {
  return (
    <Lottie
      animationData={timeIsYours}
      name="Time is Yours"
      className="w-[215px] h-[200px] md:w-[317px] md:h-[295px] lg:w-[472px] lg:h-[440px]"
    />
  );
};
