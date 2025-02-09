import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";
import { motion } from "framer-motion";
import cn from "classnames";

export const UserAvatar: React.FC<{
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  speaking?: boolean;
  variant?: "large" | "small";
}> = ({ user, speaking, variant = "large" }) => {
  return (
    <div
      className={cn(
        "tw-p-2 tw-overflow-hidden tw-rounded-full tw-flex tw-items-center tw-relative tw-justify-center",
        {
          "tw-w-[128px] tw-h-[128px] lg:tw-w-[290px] lg:tw-h-[290px]":
            variant === "large",
          "tw-w-[92px] tw-h-[92px] lg:tw-w-[176px] lg:tw-h-[176px]":
            variant === "small",
        }
      )}
    >
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{ scale: speaking ? 1 : 0.5 }}
        transition={{
          delay: 0.1,
          duration: 1,
          ease: "easeInOut",
          repeat: speaking ? Infinity : 0,
          repeatType: "reverse",
          repeatDelay: 0.1,
        }}
        className="tw-border-[6px] tw-border-border-avatar tw-rounded-full tw-w-full tw-h-full tw-absolute"
      />
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: speaking ? 1 : 0.5,
        }}
        transition={{
          duration: 1,
          repeatType: "reverse",
          ease: "easeInOut",
          repeat: speaking ? Infinity : 0,
          repeatDelay: 0.1,
        }}
        className={cn(
          "tw-border-[16px] tw-rounded-full tw-border-border-avatar tw-backdrop-blur-[15px] tw-absolute",
          {
            "tw-w-[116px] tw-h-[116px] lg:tw-w-[265px] lg:tw-h-[265px]":
              variant === "large",
            "tw-w-[112px] tw-h-[112px] lg:tw-w-[176px] lg:tw-h-[176px]":
              variant === "small",
          }
        )}
      />
      <div
        className={cn("tw-overflow-hidden tw-rounded-full", {
          "tw-w-[104px] tw-h-[104px] lg:tw-w-[242px] lg:tw-h-[242px]":
            variant === "large",
          "tw-w-[76px] tw-h-[76px] lg:tw-w-[145px] lg:tw-h-[145px]":
            variant === "small",
        })}
      >
        <Avatar
          src={orUndefined(user.imageUrl)}
          alt={orUndefined(user.name)}
          seed={user.id.toString()}
        />
      </div>
    </div>
  );
};

export default UserAvatar;
