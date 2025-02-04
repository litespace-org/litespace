import { motion } from "framer-motion";
import React from "react";

export const AnimatePopup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: {
          type: "spring",
          visualDuration: 0.4,
          bounce: 0.5,
        },
      }}
      className={className}
      exit={{ opacity: 0, scale: 0.75 }}
    >
      {children}
    </motion.div>
  );
};
