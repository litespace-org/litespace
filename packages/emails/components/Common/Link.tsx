import React from "react";
import { Link as Base } from "@react-email/components";

const Link: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => {
  return (
    <Base href={href} className="learing-[150%] text-base text-brand-700">
      {children}
    </Base>
  );
};

export default Link;
