import React from "react";

export const Optional: React.FC<{
  show: boolean;
  children: React.ReactNode;
}> = ({ show, children }) => {
  return (
    <div data-show={show} className="hidden data-[show=true]:block">
      {children}
    </div>
  );
};
