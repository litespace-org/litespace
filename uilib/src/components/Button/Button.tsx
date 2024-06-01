import React from "react";

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  type?: Button["type"];
}> = ({ children, type, onClick }) => {
  return (
    <button
      type={type}
      className="ui-bg-indigo-50 ui-hover:bg-indigo-100 ui-text-indigo-500 ui-font-bold ui-px-4 ui-py-1 ui-rounded-md ui-text-lg ui-transition-colors ui-duration-150"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
