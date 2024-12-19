import { Typography } from "@litespace/luna/Typography";
import React from "react";

export const Loader: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-10 tw-mt-20">
      <div className="tw-w-[80px] tw-h-[80px] tw-animate-spin tw-flex tw-items-center tw-relative tw-rounded-full tw-justify-center tw-bg-loader">
        <div className="tw-w-[60px] tw-h-[60px] tw-bg-white tw-rounded-full" />
        <div className="tw-w-[13px] tw-h-[10px] tw-bg-background-loader-spinner tw-rounded-full tw-absolute tw-bottom-0 tw-left-1/2 -tw-translate-x-1/2" />
      </div>

      <Typography
        element="caption"
        weight="bold"
        className="tw-text-natural-950 tw-text-center"
      >
        {text}
      </Typography>
    </div>
  );
};
