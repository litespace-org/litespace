import { useWebFormatMessage } from "@/hooks/intl";
import React from "react";
import { LocalWebId } from "@/lib/intl";

const Title: React.FC<{ id: LocalWebId }> = ({ id }) => {
  const intl = useWebFormatMessage();
  return (
    <div className="pb-2 mb-4 border-b border-border-control">
      <h3 className="text-2xl lg:text-3xl">{intl(id)}</h3>
    </div>
  );
};

export default Title;
