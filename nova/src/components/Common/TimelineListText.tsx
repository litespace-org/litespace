import React from "react";
import { Icon } from "react-feather";

const TimelineListText: React.FC<{ Icon: Icon; children: React.ReactNode }> = ({
  Icon,
  children,
}) => {
  return (
    <li className="flex flex-row items-center gap-2">
      <div>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <p className="text-sm md:text-base">{children}</p>
    </li>
  );
};

export default TimelineListText;
