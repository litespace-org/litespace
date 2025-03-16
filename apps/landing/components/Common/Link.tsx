"use client";

import React, { ComponentProps } from "react";
import BaseLink from "next/link";
import { Event, Params, track as ga } from "@/lib/ga";

const Link: React.FC<
  ComponentProps<typeof BaseLink> & {
    track?: {
      event: Event;
      params?: Params;
    };
  }
> = ({ track, ...props }) => {
  return (
    <BaseLink
      {...props}
      onClick={(event) => {
        if (track) ga(track.event, track.params);
        if (props.onClick) props.onClick(event);
      }}
    />
  );
};

export default Link;
