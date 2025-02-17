import { useDashFormatMessage } from "@/hooks/intl";
import React from "react";

const BinaryField: React.FC<{ yes?: boolean | null }> = ({ yes }) => {
  const intl = useDashFormatMessage();
  return (
    <React.Fragment>
      {yes == true
        ? intl("global.labels.yes")
        : yes === false
          ? intl("global.labels.no")
          : "-"}
    </React.Fragment>
  );
};

export default BinaryField;
