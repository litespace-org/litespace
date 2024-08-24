import Spinner from "@/icons/Spinner";
import React from "react";

const Overlay: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center z-[1000] opacity-50 cursor-wait">
      <Spinner className="inline-block mt-96" />
    </div>
  );
};

export default Overlay;
