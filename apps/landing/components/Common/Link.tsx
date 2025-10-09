"use client";

import React, { ComponentProps } from "react";
import BaseLink from "next/link";
import { Params, track as ga } from "@/lib/ga";

const Link: React.FC<
  ComponentProps<typeof BaseLink> & {
    track?: Params;
  }
> = ({ track, ...props }) => {
  return (
    <BaseLink
      {...props}
      onClick={(event) => {
        if (track) ga(track.action, track.category, track.label, track.value);
        if (props.onClick) props.onClick(event);
      }}
    />
  );
};

export default Link;
