import { useWebFormatMessage } from "@/hooks/intl";
import React from "react";

const NoSelection: React.FC = () => {
  const intl = useWebFormatMessage();
  return (
    <div className="flex items-center justify-center h-full">
      <p>{intl("chat.no")}</p>
    </div>
  );
};

export default NoSelection;
