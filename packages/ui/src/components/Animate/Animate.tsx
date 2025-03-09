import { motion } from "framer-motion";
import React from "react";

export const Animate: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.3,
          ease: "linear",
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
