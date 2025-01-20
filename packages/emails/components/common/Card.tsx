import { Container } from "@react-email/components";
import React from "react";
import cn from "classnames";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Container
      className={cn(
        "p-6 rounded-[16px] bg-natural-50 w-[504px] [&>*]:p-0 [&>*]:m-0 [&>*]:box-border",
        "flex flex-col items-center justify-center text-center"
      )}
    >
      {children}
    </Container>
  );
};

export default Card;
