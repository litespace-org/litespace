import React from "react";
import { Typography } from "@litespace/luna/Typography";

const Detail: React.FC<{
  label: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div>
      <Typography element="subtitle-1">{label}</Typography>
      <Typography element="body" className="text-foreground-lighter">
        {children}
      </Typography>
    </div>
  );
};

export default Detail;
