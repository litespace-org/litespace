import { Typography } from "@litespace/luna/Typography";
import React from "react";

export const Loader: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-10 mt-20">
      <div className="w-[80px] h-[80px] animate-spin flex items-center relative rounded-full justify-center bg-[conic-gradient(from_180deg_at_50%_50%,#1D7C4E_0deg,rgba(17,173,207,0)_360deg)]">
        <div className="w-[60px] h-[60px] bg-white rounded-full" />
        <div className="w-[13px] h-[10px] bg-[rgba(29,124,78,1)] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
      </div>

      <Typography element="h4" weight="bold" className="text-natural-950">
        {text}
      </Typography>
    </div>
  );
};
