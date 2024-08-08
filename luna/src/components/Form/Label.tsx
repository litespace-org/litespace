import React, { ReactNode } from "react";
import cn from "classnames";

export const Label: React.FC<{
  id?: string;
  children?: ReactNode;
  required?: boolean;
}> = ({ id, children, required }) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "ui-text-dark-100 ui-font-cairo ui-font-bold ui-text-arxl ui-leading-normal ui-mb-xl ui-inline-block"
      )}
    >
      {children} {required && <span className="ui-text-error">*</span>}
    </label>
  );
};
