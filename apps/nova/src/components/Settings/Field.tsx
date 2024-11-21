import React from "react";
import { Typography } from "@litespace/luna/Typography";
import { Field as CustomField } from "@litespace/luna/Form";

export const Field = ({
  label,
  field,
}: {
  label: string;
  field: React.ReactNode;
}) => {
  return (
    <CustomField
      label={
        <Typography
          element="subtitle-2"
          weight="regular"
          className="text-xl text-natural-950"
        >
          {label}
        </Typography>
      }
      field={field}
    />
  );
};

export default Field;
