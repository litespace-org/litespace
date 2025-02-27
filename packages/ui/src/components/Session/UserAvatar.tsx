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
        "p-2 overflow-hidden rounded-full flex items-center relative justify-center",
        {
          "w-[290px] h-[290px]": variant === "large",
          "w-[120px] h-[120px]": variant === "small",
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
        className="border-[6px] border-border-avatar rounded-full w-full h-full absolute"
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
          "border-[16px] rounded-full border-border-avatar backdrop-blur-[15px] absolute",
          {
            "w-[265px] h-[265px]": variant === "large",
            "w-[112] h-[112]": variant === "small",
          }
        )}
      />
      <div
        className={cn("overflow-hidden rounded-full", {
          "w-[242px] h-[242px]": variant === "large",
          "w-[90px] h-[90px]": variant === "small",
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
