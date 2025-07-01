"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

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

  useEffect(() => {
    fetch(`/animations/${animation}.json`)
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, [animation]);

  const onComplete = useCallback(() => {
    if (!ref.current) return;

    if (startingFrameAfterFirstPlay)
      ref.current.goToAndPlay(startingFrameAfterFirstPlay, true);
  }, [startingFrameAfterFirstPlay]);

  return (
    <>
      {animationData ? (
        <Lottie
          animationData={animationData}
          autoplay={autoplay}
          loop={loop}
          lottieRef={ref}
          width={width}
          onComplete={onComplete}
          height={height}
          className={className}
        />
      ) : null}
    </>
  );
};
