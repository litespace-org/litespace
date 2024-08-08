import React from "react";

export const Form = ({
  children,
  onSubmit,
  className,
}: {
  children?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};
