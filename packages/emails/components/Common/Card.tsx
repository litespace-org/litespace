import { Container } from "@react-email/components";
import React from "react";
import cn from "classnames";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Container
      className={cn(
        "p-6 rounded-[16px] bg-natural-50 max-w-[504px]",
        "flex flex-col items-center justify-center text-center"
      )}
      style={{ border: "1px solid #cccccc" }}
    >
      {children}
    </Container>
  );
};

export default Card;
