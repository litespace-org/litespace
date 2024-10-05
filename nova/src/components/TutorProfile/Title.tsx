import { LocalId, useFormatMessage } from "@litespace/luna";
import React from "react";

const Title: React.FC<{ id: LocalId }> = ({ id }) => {
  const intl = useFormatMessage();
  return (
    <div className="mb-4 pb-2 border-b border-border-control">
      <h3 className="text-2xl lg:text-3xl">{intl(id)}</h3>
    </div>
  );
};

export default Title;
