import { Typography } from "@litespace/ui/Typography";
import React from "react";

type ListProps = {
  items: string[];
};

export const BulletList: React.FC<ListProps> = ({ items }) => (
  <ul className="flex flex-col gap-2 pr-6 list-disc">
    {items.map((item, i) => (
      <li key={i} className="text-brand-500 text-[1.5rem]">
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {item}
        </Typography>
      </li>
    ))}
  </ul>
);
