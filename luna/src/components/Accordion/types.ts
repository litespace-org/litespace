import React from "react";

export type AccordionItem = {
  id: number | string;
  trigger: React.ReactNode;
  content: React.ReactNode;
};
