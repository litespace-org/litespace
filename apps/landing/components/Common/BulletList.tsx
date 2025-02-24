import React from "react";
import { Text } from "@/components/Layout/Section";

type Props = {
  items: string[];
};

export const BulletList: React.FC<Props> = ({ items }) => (
  <ul className="flex flex-col gap-2 pr-1 list-none">
    {items.map((text, i) => (
      <li key={i} className="flex flex-row gap-2 items-start">
        <span className="inline-block w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-2 sm:mt-[14px]" />
        <Text>{text}</Text>
      </li>
    ))}
  </ul>
);
