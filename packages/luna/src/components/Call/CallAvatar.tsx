import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { motion } from "framer-motion";
import cn from "classnames";

export const CallAvatar: React.FC<{
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  speaking?: boolean;
  variant?: "Large" | "Small";
}> = ({ user, speaking, variant = "Large" }) => {
  return (
    <div
      className={cn(
        "tw-p-2 tw-overflow-hidden tw-rounded-full tw-flex tw-items-center tw-relative tw-justify-center",
        {
          "tw-w-[290px] tw-h-[290px]": variant === "Large",
          "tw-w-[120px] tw-h-[120px]": variant === "Small",
        }
      )}
    >
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: speaking ? 1 : 0.5,
        }}
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
            "tw-w-[265px] tw-h-[265px]": variant === "Large",
            "tw-w-[112] tw-h-[112]": variant === "Small",
          }
        )}
      />
      <div
        className={cn("tw-overflow-hidden tw-rounded-full", {
          "tw-w-[242px] tw-h-[242px]": variant === "Large",
          "tw-w-[90px] tw-h-[90px]": variant === "Small",
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

export default CallAvatar;
