import { Void } from "@litespace/types";
import React from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import { Button, ButtonType, ButtonVariant } from "@/components/Button";

export const EndSession: React.FC<{
  onClick: Void;
}> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant={ButtonVariant.Secondary}
      type={ButtonType.Error}
    >
      <CallIncoming className="[&>*]:tw-stroke-destructive-700" />
    </Button>
  );
};

export default EndSession;
