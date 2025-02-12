import React from "react";
import { Button as Base } from "@react-email/components";

const Button: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => {
  return (
    <Base
      href={href}
      className="h-[40px] m-0 px-[16px] py-[8px] rounded-[8px] bg-brand-700 box-border"
    >
      {children}
    </Base>
  );
};

export default Button;
