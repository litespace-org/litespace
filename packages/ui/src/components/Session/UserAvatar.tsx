import React from "react";
import { Avatar } from "@/components/Avatar";
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
          "w-[140px] h-[140px] md:w-[302px] md:h-[302px]": variant === "large",
          "w-[112px] h-[112px] lg:w-[205px] lg:h-[205px]": variant === "medium",
          "w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[132px] lg:h-[132px]":
            variant === "small",
        }
      )}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: speaking ? 1 : 0.5, opacity: speaking ? 1 : 0 }}
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
            "border-[6px] md:border-[8px]": variant === "large",
            "border-[5px] lg:border-[7px]": variant === "medium",
            "border-[4px] lg:border-[6px]": variant === "small",
          }
        )}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: speaking ? 1 : 0.5, opacity: speaking ? 1 : 0 }}
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
            "border-[8px] w-[116px] h-[116px] md:border-[10px] md:w-[274px] md:h-[274px]":
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
          "w-[104px] h-[104px] md:w-[242px] md:h-[242px]": variant === "large",
          "w-[76px] h-[76px] lg:w-[145px] lg:h-[145px]": variant === "medium",
          "w-16 h-16 md:w-[84px] md:h-[84px] lg:w-[96px] lg:h-[96px]":
            variant === "small",
        })}
      >
        <Avatar
          src={user.imageUrl}
          alt={user.name}
          seed={user.id}
          object="cover"
        />
      </div>
    </div>
  );
};

export default UserAvatar;
