import React from "react";
import authHero from "@/animations/animated-auth-hero.json";
import Lottie from "lottie-react";

const Aside: React.FC = () => {
  return (
    <aside className="max-w-[704px] shrink flex items-center justify-center">
      <Lottie animationData={authHero} autoplay loop />
    </aside>
  );
};

export default Aside;
