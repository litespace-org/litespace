"use client";
import CurvedDashedLine from "@litespace/assets/CurvedDashedLine";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useEffect, useState } from "react";

export const CurvedLine = () => {
  const mq = useMediaQuery();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      style={{
        transform: !mq.md ? "rotateX(180deg)" : "rotate(220deg)",
      }}
      className="absolute -bottom-12 md:-bottom-[37px] -left-0 md:-left-[115%] w-7 md:w-[35px] h-[15px]"
    >
      <CurvedDashedLine />
    </div>
  );
};
