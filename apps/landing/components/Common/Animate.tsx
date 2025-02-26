"use client";
import { AnimatePresence, motion } from "framer-motion";

export type Tab = "monthly" | "quarter" | "half" | "annual";

export const Animate: React.FC<{ children: React.ReactNode; tab: Tab }> = ({
  children,
  tab,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={tab}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.2,
            ease: "linear",
          },
        }}
        exit={{
          opacity: 0,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
