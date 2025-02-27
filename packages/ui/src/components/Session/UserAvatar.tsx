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
        "p-2 overflow-hidden rounded-full flex items-center relative justify-center",
        {
          "w-[140px] h-[140px] lg:w-[302px] lg:h-[302px]": variant === "large",
          "w-[112px] h-[112px] lg:w-[205px] lg:h-[205px]": variant === "medium",
          "w-[80px] h-[80px] lg:w-[132px] lg:h-[132px]": variant === "small",
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
          "border-border-avatar rounded-full w-full h-full absolute",
          {
            "border-[6px] lg:border-[8px]": variant === "large",
            "border-[5px] lg:border-[7px]": variant === "medium",
            "border-[4px] lg:border-[6px]": variant === "small",
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
          "rounded-full border-border-avatar backdrop-blur-[15px] absolute",
          {
            "border-[8px] w-[116px] h-[116px] lg:border-[10px] lg:w-[274px] lg:h-[274px]":
              variant === "large",
            "border-[7px] w-[92px] h-[92px] lg:border-[9px] lg:w-[177px] lg:h-[177px]":
              variant === "medium",
            "border-[6px] w-[68px] h-[68px] lg:border-[8px] lg:w-[112px] lg:h-[112px]":
              variant === "small",
          }
        )}
      />
      <div
        className={cn("overflow-hidden rounded-full", {
          "w-[104px] h-[104px] lg:w-[242px] lg:h-[242px]": variant === "large",
          "w-[76px] h-[76px] lg:w-[145px] lg:h-[145px]": variant === "medium",
          "w-[56px] h-[56px] lg:w-[96px] lg:h-[96px]": variant === "small",
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
