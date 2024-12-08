import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { motion } from "framer-motion";

export const CallAvatar: React.FC<{
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  talking?: boolean;
}> = ({ user, talking }) => {
  return (
    <div className="tw-w-[290px] tw-h-[290px] tw-p-2 tw-overflow-hidden tw-rounded-full tw-flex tw-items-center tw-relative tw-justify-center">
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: talking ? 1 : 0.5,
        }}
        transition={{ delay: 0.1, duration: 0.3, ease: "easeInOut" }}
        className="tw-border-[6px] tw-border-border-avatar tw-rounded-full tw-w-full tw-h-full tw-absolute"
      />
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: talking ? 1 : 0.5,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="tw-w-[265px] tw-h-[265px] tw-border-[16px] tw-rounded-full tw-border-border-avatar tw-backdrop-blur-[15px] tw-absolute"
      />
      <div className="tw-w-[242px] tw-h-[242px] tw-overflow-hidden tw-rounded-full">
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
