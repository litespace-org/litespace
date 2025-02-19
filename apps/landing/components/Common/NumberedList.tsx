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
          className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
        >
          {item}
        </Typography>
      </li>
    ))}
  </ol>
);
