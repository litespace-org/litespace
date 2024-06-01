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
      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-500 font-bold px-4 py-1 rounded-md text-lg transition-colors duration-150"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
