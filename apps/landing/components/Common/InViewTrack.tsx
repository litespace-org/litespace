"use client";

import { track } from "@/lib/ga";
import React from "react";
import { InView } from "react-intersection-observer";
import { Params, Event } from "@/lib/ga";

const InViewTrack: React.FC<{ event: Event } & Params> = ({
  event,
  ...params
}) => {
  return (
    <InView
      onChange={(inview) => {
        if (inview) track(event, params);
      }}
    />
  );
};

export default InViewTrack;
