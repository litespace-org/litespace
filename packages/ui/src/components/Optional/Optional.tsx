import React from "react";

export const Optional: React.FC<{
  show: boolean;
  children: React.ReactNode;
  unmount?: boolean;
}> = ({ show, children, unmount = false }) => {
  if (unmount && !show) return;
  if (unmount && show) return children;
  return (
    <div data-show={show} className="hidden data-[show=true]:block">
      {children}
    </div>
  );
};
