import React from "react";
import CheckMark from "@litespace/assets/CheckMark";
import { Typography } from "@/components/Typography";

export const FeaturesList: React.FC<{ features: string[] }> = ({
  features,
}) => {
  return (
    <div className="flex">
      <ul className="mt-4 font-normal">
        {features.map((feature, idx) => (
          <li key={idx} className="flex gap-2">
            <CheckMark className="w-[12px] h-[12px] mt-[2px] xl:w-[16px] xl:h-[16px] flex-shrink-0" />
            <Typography
              tag="span"
              className="font-normal mb-[8px] text-tiny text-natural-700"
            >
              {feature}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  );
};
