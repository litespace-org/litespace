import React from "react";

export const Form: React.FC<{
  children?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}> = ({ children, onSubmit, className }) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};
