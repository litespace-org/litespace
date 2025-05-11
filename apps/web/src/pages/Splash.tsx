import React, { Suspense } from "react";
import logo from "@/animations/animated-logo.json";
import Lottie from "react-lottie";

const Fallback: React.FC = () => {
  return (
    <div className="bg-natural-50 w-full h-screen flex items-center justify-center">
      <div className="w-96 h-96">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: logo,
          }}
          isClickToPauseDisabled={true}
          style={{ cursor: "default" }}
        />
      </div>
    </div>
  );
};

const Splash: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>;
};

export default Splash;
