"use client";
import React from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type AnimationId = "hero" | "test";

type AnimationIdStateMap = {
  hero: "State Machine 1";
  test: "bumpy";
};

type Props<T extends AnimationId> = {
  animation: T;
  state: AnimationIdStateMap[T];
  autoplay?: boolean;
};

const animations: Record<AnimationId, string> = {
  hero: "animations/hero.riv",
  test: "https://cdn.rive.app/animations/vehicles.riv",
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
      fit: Fit.None,
      alignment: Alignment.Center,
    }),
    autoplay,
  });

  return <RiveComponent />;
};
