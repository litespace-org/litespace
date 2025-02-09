import { Void } from "@litespace/types";
import React from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import { Button } from "@/components/Button";

export const EndSession: React.FC<{
  onClick: Void;
}> = ({ onClick }) => {
  return (
    <Button
      className="!tw-w-14 !tw-h-10 lg:!tw-h-12 lg:!tw-w-[72px]"
      onClick={onClick}
      variant={"secondary"}
      type={"error"}
    >
      <CallIncoming className="[&>*]:tw-stroke-destructive-700" />
    </Button>
  );
};

export default EndSession;
