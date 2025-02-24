import { Typography } from "@litespace/ui/Typography";
import React from "react";

type ListProps = {
  items: string[];
};

export const NumberedList: React.FC<ListProps> = ({ items }) => (
  <ol className="flex flex-col gap-2 pr-6 list-decimal">
    {items.map((item, i) => (
      <li key={i} className="text-[1.5rem]">
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {item}
        </Typography>
      </li>
    ))}
  </ol>
);
