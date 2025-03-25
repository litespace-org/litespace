import { Void } from "@litespace/types";
import React from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import { Button } from "@litespace/ui/Button";

export const EndSession: React.FC<{
  onClick: Void;
}> = ({ onClick }) => {
  return (
    <Button onClick={onClick} variant={"secondary"} type={"error"}>
      <CallIncoming className="[&>*]:stroke-destructive-700" />
    </Button>
  );
};

export default EndSession;
