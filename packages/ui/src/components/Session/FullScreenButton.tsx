import React from "react";
import FullScreen from "@litespace/assets/FullScreen";
import Minimize from "@litespace/assets/Minimize";
import { Void } from "@litespace/types";
import { Button } from "@/components/Button";

export const FullScreenButton: React.FC<{ enabled: boolean; toggle: Void }> = ({
  enabled,
  toggle,
}) => {
  return (
    <Button
      className="!tw-w-[42px] !tw-h-[42px] lg:!tw-h-16 lg:!tw-w-16 !tw-p-0 !tw-rounded-full"
      onClick={toggle}
    >
      {enabled ? (
        <Minimize className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8" />
      ) : (
        <FullScreen className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8" />
      )}
    </Button>
  );
};

export default FullScreenButton;
