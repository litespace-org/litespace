"use client";

import { AnimatePresence, motion } from "framer-motion";

export const ActiveLine: React.FC = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.3,
          },
        }}
        exit={{ opacity: 0 }}
        className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-brand-700 rounded-t-[10px]"
      />
    </AnimatePresence>
  );
};
