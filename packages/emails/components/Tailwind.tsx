import React from "react";
import { Tailwind as Base } from "@react-email/components";

const Tailwind: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Base
      config={{
        theme: {
          fontFamily: {
            cairo: ["Cairo", "sans-serif"],
          },
          extend: {
            colors: {
              brand: {
                500: "#2bb572",
                700: "#1d7c4e",
              },
              natural: {
                950: "#0d0d0d",
                700: "#4d4d4d",
                50: "#f2f2f2",
              },
            },
          },
        },
      }}
    >
      {children}
    </Base>
  );
};

export default Tailwind;
