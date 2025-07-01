"use client";

import React, { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import notifications from "@/animations/notifications.json";
import anytime from "@/animations/anytime.json";
import novelity from "@/animations/novelity.json";
import timeIsYours from "@/animations/time-is-yours.json";
import allInEnglish from "@/animations/all-lesson-english.json";
import oneOnOne from "@/animations/one-and-one.json";

const animations = {
  notifications,
  anytime,
  novelity,
  timeIsYours,
  allInEnglish,
  oneOnOne,
};

type Props = {
  animation: keyof typeof animations;
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
  return (
    <Lottie
      animationData={animations[animation]}
      autoplay={autoplay}
      loop={loop}
      lottieRef={ref}
      width={width}
      height={height}
      className={className}
    />
  );
};
