"use client";

import React, { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

const animations: Record<string, unknown> = {};

type Props = {
  animation: keyof typeof animations;
  autoplay?: boolean;
  loop?: boolean;
};

export const LottieAnimate = ({
  animation,
  autoplay = true,
  loop = true,
}: Props) => {
  const ref = useRef<LottieRefCurrentProps>(null);
  return (
    <Lottie
      animationData={animations[animation]}
      autoplay={autoplay}
      loop={loop}
      lottieRef={ref}
    />
  );
};
