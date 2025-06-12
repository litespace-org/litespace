"use client";
import React from "react";
import Lottie from "lottie-react";

import hero from "@/animations/motion-hero.json";

const animations = {
  hero: hero,
};

export const LottieAnimate: React.FC<{ anim: keyof typeof animations }> = ({
  anim,
}) => {
  return <Lottie animationData={animations[anim]} autoplay loop />;
};
