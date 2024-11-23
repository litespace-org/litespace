import React, { ComponentProps } from "react";
import cn from "classnames";

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "subtitle-1"
  | "subtitle-2"
  | "body"
  | "caption"
  | "tiny-text";

type TypographyWeight = "bold" | "semibold" | "medium" | "regular";

type Tag = keyof JSX.IntrinsicElements;

const typographyHtmlMap: Record<TypographyElement, Tag> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "subtitle-1": "h5",
  "subtitle-2": "h6",
  body: "p",
  caption: "span",
  "tiny-text": "span",
};

type Props<T extends Tag> = {
  element?: TypographyElement;
  tag?: T;
  weight?: TypographyWeight;
  children?: React.ReactNode;
  className?: string;
} & ComponentProps<T>;

export const Typography = <T extends Tag>({
  element = "body",
  tag,
  weight,
  children,
  className,
  ...props
}: Props<T>) => {
  return React.createElement(tag || typographyHtmlMap[element], {
    children,
    className: cn(
      "tw-font-cairo tw-leading-[150%]",
      {
        "tw-text-[4rem]": element === "h1",
        "tw-text-[3rem]": element === "h2",
        "tw-text-[2.5rem]": element === "h3",
        "tw-text-[2rem]": element === "h4",
        "tw-text-[1.5rem]": element === "subtitle-1",
        "tw-text-[1.25rem]": element === "subtitle-2",
        "tw-text-[1rem]": element === "body",
        "tw-text-[0.875rem]": element === "caption",
        "tw-text-[0.70rem]": element === "tiny-text",
        "tw-font-bold": weight === "bold",
        "tw-font-semibold": weight === "semibold",
        "tw-font-medium": weight === "medium",
        "tw-font-normal": weight === "regular",
      },
      className
    ),
    ...props,
  });
};
