import React from "react";

export const Card: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="bg-surface-100 p-6 border border-border rounded">
      {children}
    </div>
  );
};
