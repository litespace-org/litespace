"use client";
import React, { useState } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { Loading } from "@litespace/ui/Loading";
import { AnimatePresence, motion } from "framer-motion";

type AnimationId = "hero" | "notification" | "cta";

type AnimationIdStateMap = {
  hero: "State Machine 1";
  notification: "State Machine 1";
  cta: "main_comp";
};

type Props<T extends AnimationId> = {
  animation: T;
  state?: AnimationIdStateMap[T];
  autoplay?: boolean;
  className?: string;
};

const animations: Record<AnimationId, string> = {
  hero: "animations/hero.riv",
  notification: "animations/notification.riv",
  cta: "animations/cta.riv",
};

export const RiveAnimate = <T extends AnimationId>({
  animation,
  state,
  className,
  autoplay = true,
}: Props<T>) => {
  const [loaded, setLoaded] = useState(false);

  const { RiveComponent } = useRive({
    src: animations[animation],
    stateMachines: state,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay,
    onLoad: () => setLoaded(true),
  });

  return (
    <div className="relative flex justify-center items-center w-full h-full">
      <AnimatePresence>
        <motion.div
          key={animation + "1"}
          initial={{ opacity: 1 }}
          animate={loaded ? { opacity: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute"
        >
          <Loading />
        </motion.div>

        <motion.div
          key={animation + "2"}
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute flex justify-center items-center w-full h-full"
        >
          <RiveComponent className={className} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
