import React from "react";
import { motion } from "framer-motion";

export const Animate: React.FC<{ children: React.ReactNode; name: string }> = ({
  children,
  name,
}) => {
  return (
    <motion.div
      key={name}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.1,
          ease: "linear",
        },
      }}
      exit={{
        opacity: 0,
      }}
    >
      {children}
    </motion.div>
  );
};
