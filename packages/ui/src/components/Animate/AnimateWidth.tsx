import { motion } from "framer-motion";
import cn from "classnames";
import React from "react";

export const AnimateWidth: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        width: 0,
      }}
      animate={{
        opacity: 1,
        width: "auto",
        transition: {
          duration: 0.3,
          ease: "linear",
        },
      }}
      exit={{
        opacity: 0,
        width: 0,
      }}
      className={cn("tw-overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
};
