"use client";
import React, { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import hero from "@/public/animations/motion-hero.json";
import test from "@/public/animations/JSON-notification.json";
import test2 from "@/public/animations/anytime-02.json";
import test3 from "@/public/animations/your-time-is-yours.json";
import test4 from "@/public/animations/Novelty-motion.json";

const animations: Record<string, any> = {
  hero,
  test,
  test2,
  test3,
  test4,
};

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
  return <Lottie 
    animationData={animations[animation]} 
    autoplay={autoplay}
    loop={loop}
    lottieRef={ref} />
};
