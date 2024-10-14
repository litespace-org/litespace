import React from "react";
import { Check, X } from "react-feather";

const BooleanField: React.FC<{ checked: boolean }> = ({ checked }) => {
  return (
    <div className="flex justify-center items-center">
      {checked ? <Check /> : <X />}
    </div>
  );
};

export default BooleanField;
