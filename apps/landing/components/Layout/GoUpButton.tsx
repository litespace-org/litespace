"use client";

import ArrowUp from "@litespace/assets/ArrowUp";
import React from "react";

const ScrollButton = () => {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group hidden lg:inline-block self-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-lg"
    >
      <ArrowUp className="group-hover:[&>*]:fill-brand-400 group-active:[&>*]:fill-brand-500 [&>*]:transition-colors [&>*]:duration-200 [&>*]:ease-out" />
    </button>
  );
};

export default ScrollButton;
