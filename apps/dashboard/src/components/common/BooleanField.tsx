import React from "react";
import { Check, X } from "react-feather";

const BooleanField: React.FC<{ checked: boolean }> = ({ checked }) => {
  return checked ? <Check /> : <X />;
};

export default BooleanField;
