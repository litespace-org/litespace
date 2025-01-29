import { LocalId } from "@litespace/ui/locales";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";

const Title: React.FC<{ id: LocalId }> = ({ id }) => {
  const intl = useFormatMessage();
  return (
    <div className="pb-2 mb-4 border-b border-border-control">
      <h3 className="text-2xl lg:text-3xl">{intl(id)}</h3>
    </div>
  );
};

export default Title;
