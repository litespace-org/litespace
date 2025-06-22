"use client";
import React from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type AnimationId = "hero" | "notification";

type AnimationIdStateMap = {
  hero: "State Machine 1";
  notification: "State Machine 1";
};

type Props<T extends AnimationId> = {
  animation: T;
  state: AnimationIdStateMap[T];
  autoplay?: boolean;
};

const animations: Record<AnimationId, string> = {
  hero: "animations/hero.riv",
  notification: "animations/notification.riv",
};

export const RiveAnimate = <T extends AnimationId>({
  animation,
  state,
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

  return <RiveComponent />;
};
