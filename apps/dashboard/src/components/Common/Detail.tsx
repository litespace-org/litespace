import React from "react";
import { Typography } from "@litespace/ui/Typography";

const Detail: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div>
      <Typography tag="h1" className="text-subtitle-1">
        {label}
      </Typography>
      <Typography tag="span" className="text-foreground-lighter text-body">
        {children}
      </Typography>
    </div>
  );
};

export default Detail;
