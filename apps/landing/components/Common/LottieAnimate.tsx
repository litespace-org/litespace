"use client";

import React, { useEffect, useRef, useState } from "react";
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
  loop?: boolean;
};

export const LottieAnimate = ({
  animation,
  className,
  width,
  height,
  autoplay = true,
  loop = true,
}: Props) => {
  const ref = useRef<LottieRefCurrentProps>(null);
  const [animData, setAnimData] = useState<JSON | null>(null);

  useEffect(() => {
    fetch(`/animations/${animation}.json`)
      .then((res) => res.json())
      .then((data) => setAnimData(data));
  }, [animation]);

  return (
    <>
      {animData ? (
        <Lottie
          animationData={animData}
          autoplay={autoplay}
          loop={loop}
          lottieRef={ref}
          width={width}
          height={height}
          className={className}
        />
      ) : null}
    </>
  );
};
