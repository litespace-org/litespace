"use client"

import React, { useRef, useEffect } from "react";

type Props = {
  /**
   * the html component id to scroll to
   */
  destination: string;
  /**
   * how many pixels away this component to the start auto-scroll
   */
  margin?: number;
}

const ScrollPivot: React.FC<Props> = ({
  destination,
  margin = 100,
}) => {
  const div = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dest = document.getElementById(destination);

    if (!dest) return;
    if (!div.current) return;

    console.log(window.scrollY, div.current.offsetTop - margin)
    if (window.scrollY >= div.current.offsetTop - margin) {
      window.scrollTo({
        top: dest.offsetTop,
        behavior: "smooth",
      })
    }
  }, [div.current?.offsetTop]);

  return (
    <div ref={div}></div>
  );
}

export default ScrollPivot;
