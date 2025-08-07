"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loading } from "@litespace/ui/Loading";
import cn from "classnames";

type AnimationKey =
  | "anytime"
  | "notifications"
  | "novelity"
  | "one-and-one"
  | "time-is-yours"
  | "all-in-english"
  | "motion-hero";

type Props = {
  animation: AnimationKey;
  className?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean | number;
  startingFrameAfterFirstPlay?: number;
};

export const LottieAnimate = ({
  animation,
  className,
  width,
  height,
  autoplay = true,
  loop = true,
  startingFrameAfterFirstPlay,
}: Props) => {
  const ref = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<JSON | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/animations/${animation}.json`)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(console.error);
  }, [animation]);

  const onComplete = useCallback(() => {
    if (!ref.current) return;

    if (startingFrameAfterFirstPlay)
      ref.current.goToAndPlay(startingFrameAfterFirstPlay, true);
  }, [startingFrameAfterFirstPlay]);

  if (!animationData) return null;

  return (
    <div
      className={cn(
        "relative flex justify-center items-center w-full h-full",
        className
      )}
    >
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
          <Lottie
            animationData={animationData}
            autoplay={autoplay}
            loop={loop}
            lottieRef={ref}
            width={width}
            onComplete={onComplete}
            height={height}
            onLoadedImages={() => setLoaded(true)}
            className="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
