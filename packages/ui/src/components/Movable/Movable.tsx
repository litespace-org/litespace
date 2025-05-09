import React from "react";
import { motion } from "framer-motion";
import cn from "classnames";

export const Movable: React.FC<{
  container: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  className?: string;
}> = ({ container, children, className }) => {
  return (
    <motion.div
      id="drag"
      drag
      draggable
      dragElastic={0}
      dragConstraints={container}
      whileDrag={{ scale: 1.05 }}
      dragMomentum={false}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
};
