import React from "react";
import FullScreen from "@litespace/assets/FullScreen";
import { Void } from "@litespace/types";
export const FullScreenButton: React.FC<{ enabled: boolean; toggle: Void }> = ({
  enabled,
  toggle,
}) => {
  return (
    <button
      className="tw-rounded-full tw-w-16 tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-brand-700"
      onClick={toggle}
    >
      {enabled ? null : <FullScreen className="[&>*]:tw-stroke-natural-50" />}
    </button>
  );
};

export default FullScreenButton;
