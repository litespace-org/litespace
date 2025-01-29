import React from "react";
import { motion } from "framer-motion";

export const MovableMedia: React.FC<{
  container: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}> = ({ container, children }) => {
  return (
    <motion.div
      drag
      draggable
      dragElastic={0}
      dragConstraints={container}
      whileDrag={{ scale: 1.05 }}
      dragMomentum={false}
      className="tw-cursor-pointer"
    >
      {children}
    </motion.div>
  );
};
