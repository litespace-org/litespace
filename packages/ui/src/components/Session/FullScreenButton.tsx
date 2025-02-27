import React from "react";
import FullScreen from "@litespace/assets/FullScreen";
import Minimize from "@litespace/assets/Minimize";
import { Void } from "@litespace/types";
import { Button } from "@/components/Button";
import cn from "classnames";

export const FullScreenButton: React.FC<{
  enabled: boolean;
  toggle: Void;
  chat?: boolean;
}> = ({ enabled, chat, toggle }) => {
  return (
    <Button
      className="!w-[42px] !h-[42px] lg:!h-16 lg:!w-16 !p-0 !rounded-full"
      onClick={toggle}
    >
      {enabled ? (
        <Minimize
          className={cn(
            "[&>*]:stroke-natural-50",
            chat ? "w-6 h-6" : "w-4 h-4 lg:h-8 lg:w-8"
          )}
        />
      ) : (
        <FullScreen
          className={cn(
            "[&>*]:stroke-natural-50",
            chat ? "w-6 h-6" : "w-4 h-4 lg:h-8 lg:w-8"
          )}
        />
      )}
    </Button>
  );
};

export default FullScreenButton;
