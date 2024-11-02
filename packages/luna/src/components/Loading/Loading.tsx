import { Spinner } from "@/icons/Spinner";
import React from "react";
import cn from "classnames";

const Loading: React.FC<{ className?: string; show?: boolean }> = ({
  className,
  show = true,
}) => {
  if (!show) return null;
  return (
    <div className={cn("tw-flex tw-items-center tw-justify-center", className)}>
      <Spinner />
    </div>
  );
};

export default Loading;
