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
    <Button className="!h-16 !w-16 !p-0 !rounded-full" onClick={toggle}>
      {enabled ? (
        <Minimize className="[&>*]:stroke-natural-50" />
      ) : (
        <FullScreen className="[&>*]:stroke-natural-50" />
      )}
    </Button>
  );
};

export default FullScreenButton;
