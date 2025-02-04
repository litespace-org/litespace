import React, { useMemo } from "react";
import Lottie from "react-lottie";
import successAnimation from "@/components/Loading/success.json";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import { Button } from "@/components/Button";

export const LoaderSuccess: React.FC<{
  text: string;
  action: { onClick: Void; label: string };
}> = ({ text, action }) => {
  const defaultOptions = useMemo(
    () => ({
      loop: false,
      autoplay: true,
      animationData: successAnimation,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    }),
    []
  );

  return (
    <div className="tw-grid tw-gap-6">
      <div className="tw-flex tw-flex-col tw-gap-6">
        <Lottie options={defaultOptions} height={141} width={141} />
        <Typography className="tw-text-natural-700" element="body">
          {text}
        </Typography>
      </div>
      <Button className="tw-w-full" onClick={action.onClick}>
        {action.label}
      </Button>
    </div>
  );
};
