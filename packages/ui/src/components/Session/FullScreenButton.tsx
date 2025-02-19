import React from "react";
import FullScreen from "@litespace/assets/FullScreen";
import Minimize from "@litespace/assets/Minimize";
import { Void } from "@litespace/types";
import { Button } from "@/components/Button";
import cn from "classnames"

export const FullScreenButton: React.FC<{ enabled: boolean; toggle: Void; chat?: boolean; }> = ({
  enabled,
  chat,
  toggle,
}) => {
  return (
    <Button
      className="!tw-w-[42px] !tw-h-[42px] lg:!tw-h-16 lg:!tw-w-16 !tw-p-0 !tw-rounded-full"
      onClick={toggle}
    >
      {enabled ? (
        <Minimize className={cn("[&>*]:tw-stroke-natural-50", chat ? "tw-w-6 tw-h-6" : "tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8")} />
      ) : (
        <FullScreen className={cn("[&>*]:tw-stroke-natural-50", chat ? "tw-w-6 tw-h-6" : "tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8")} />
      )}
    </Button>
  );
};

export default FullScreenButton;
