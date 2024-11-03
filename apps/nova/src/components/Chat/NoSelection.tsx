import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const NoSelection: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-center h-full">
      <p>{intl("chat.no")}</p>
    </div>
  );
};

export default NoSelection;
