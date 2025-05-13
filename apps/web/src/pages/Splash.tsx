import React, { Suspense, useRef } from "react";
import logo from "@/animations/animated-logo.json";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import cn from "classnames";

type Position = "center" | "top";

const Fallback: React.FC<{ position: Position }> = ({ position }) => {
  const ref = useRef<LottieRefCurrentProps>(null);
  return (
    <div
      className={cn("bg-natural-50 w-full  flex items-center justify-center", {
        "h-screen": position === "center",
        "mt-[15vh]": position === "top",
      })}
    >
      <div className="w-48 h-40">
        <Lottie animationData={logo} autoplay loop lottieRef={ref} />
      </div>
    </div>
  );
};

const Splash: React.FC<{
  children?: React.ReactNode;
  position?: Position;
}> = ({ children, position = "center" }) => {
  return (
    <Suspense fallback={<Fallback position={position} />}>{children}</Suspense>
  );
};

export default Splash;
