"use client";

import React, { ComponentProps } from "react";
import { Accordion as BaseAccordion } from "@litespace/ui/Accordion";
import { track } from "@/lib/analytics";

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
        track({
          category: "other",
          action: "view_faq_item",
          label: item.title,
        });
      }}
    />
  );
};

export default Accordion;
