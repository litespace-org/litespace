"use client";
import React from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

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
  const { RiveComponent } = useRive({
    src: animations[animation],
    stateMachines: state,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay,
  });

  return <RiveComponent className={className} />;
};
