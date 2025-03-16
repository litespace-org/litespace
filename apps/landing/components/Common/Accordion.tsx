"use client";

import React, { ComponentProps } from "react";
import { Accordion as BaseAccordion } from "@litespace/ui/Accordion";
import { track } from "@/lib/ga";

const Accordion: React.FC<ComponentProps<typeof BaseAccordion>> = ({
  ...props
}) => {
  return (
    <BaseAccordion
      {...props}
      onValueChange={(value) => {
        if (props.onValueChange) props.onValueChange(value);
        const item = props.items.find((item) => item.id === value);
        if (!item) return;
        track("view_faq_item", {
          action: "button",
          title: item.title,
          id: item.id,
        });
      }}
    />
  );
};

export default Accordion;
