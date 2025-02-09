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
  /**
   * large is for focused stream
   * medium is for presession stream
   * large is for unfocused stream
   */
  variant?: "large" | "medium" | "small";
}> = ({ user, speaking, variant = "large" }) => {
  return (
    <div
      className={cn(
        "tw-p-2 tw-overflow-hidden tw-rounded-full tw-flex tw-items-center tw-relative tw-justify-center",
        {
          "tw-w-[140px] tw-h-[140px] lg:tw-w-[302px] lg:tw-h-[302px]":
            variant === "large",
          "tw-w-[112px] tw-h-[112px] lg:tw-w-[205px] lg:tw-h-[205px]":
            variant === "medium",
          "tw-w-[80px] tw-h-[80px] lg:tw-w-[132px] lg:tw-h-[132px]":
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
        className={cn(
          "tw-border-border-avatar tw-rounded-full tw-w-full tw-h-full tw-absolute",
          {
            "tw-border-[6px] lg:tw-border-[8px]": variant === "large",
            "tw-border-[5px] lg:tw-border-[7px]": variant === "medium",
            "tw-border-[4px] lg:tw-border-[6px]": variant === "small",
          }
        )}
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
          "tw-rounded-full tw-border-border-avatar tw-backdrop-blur-[15px] tw-absolute",
          {
            "tw-border-[8px] tw-w-[116px] tw-h-[116px] lg:tw-border-[10px] lg:tw-w-[274px] lg:tw-h-[274px]":
              variant === "large",
            "tw-border-[7px] tw-w-[92px] tw-h-[92px] lg:tw-border-[9px] lg:tw-w-[177px] lg:tw-h-[177px]":
              variant === "medium",
            "tw-border-[6px] tw-w-[68px] tw-h-[68px] lg:tw-border-[8px] lg:tw-w-[112px] lg:tw-h-[112px]":
              variant === "small",
          }
        )}
      />
      <div
        className={cn("tw-overflow-hidden tw-rounded-full", {
          "tw-w-[104px] tw-h-[104px] lg:tw-w-[242px] lg:tw-h-[242px]":
            variant === "large",
          "tw-w-[76px] tw-h-[76px] lg:tw-w-[145px] lg:tw-h-[145px]":
            variant === "medium",
          "tw-w-[56px] tw-h-[56px] lg:tw-w-[96px] lg:tw-h-[96px]":
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
