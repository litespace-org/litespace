import { Spinner } from "@/icons/Spinner";
import React from "react";

const Overlay: React.FC = () => {
  return (
    <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-flex tw-justify-center tw-z-[1000] tw-opacity-50 tw-cursor-wait">
      <Spinner className="tw-inline-block tw-mt-96" />
    </div>
  );
};

export default Overlay;
