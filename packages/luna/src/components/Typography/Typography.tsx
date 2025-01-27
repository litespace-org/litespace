import React, { ComponentProps, useMemo } from "react";
import cn from "classnames";
import { useMediaQueries } from "@/hooks/media";

type MediaQuery = "default" | "sm" | "md" | "lg" | "xl" | "xxl";

type MediaQueryMap<T> = { default: T } & Partial<
  Record<Exclude<MediaQuery, "default">, T>
>;

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

type TypographyElementMap = MediaQueryMap<TypographyElement>;

type TypographyWeight = "bold" | "semibold" | "medium" | "regular";

type TypographyWeightMap = MediaQueryMap<TypographyWeight>;

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
  element?: TypographyElement | TypographyElementMap;
  tag?: T;
  weight?: TypographyWeight | TypographyWeightMap;
  children?: React.ReactNode;
  className?: string;
} & ComponentProps<T>;

export const Typography = <T extends Tag>({
  element = "body",
  weight = "regular",
  tag,
  children,
  className,
  ...props
}: Props<T>) => {
  const mq = useMediaQueries();
  const selectedElement: TypographyElement = useMemo(() => {
    if (typeof element === "string") return element;
    if (mq.xxl && element.xxl) return element.xxl;
    if (mq.xl && element.xl) return element.xl;
    if (mq.lg && element.lg) return element.lg;
    if (mq.md && element.md) return element.md;
    if (mq.sm && element.sm) return element.sm;
    return element.default;
  }, [mq, element]);

  const selectedWeight = useMemo(() => {
    if (typeof weight === "string") return weight;
    if (mq.xxl && weight.xxl) return weight.xxl;
    if (mq.xl && weight.xl) return weight.xl;
    if (mq.lg && weight.lg) return weight.lg;
    if (mq.md && weight.md) return weight.md;
    if (mq.sm && weight.sm) return weight.sm;
    return weight.default;
  }, [mq, weight]);

  return React.createElement(tag || typographyHtmlMap[selectedElement], {
    children,
    className: cn(
      "tw-font-cairo tw-leading-[150%]",
      {
        "tw-text-[4rem]": selectedElement === "h1",
        "tw-text-[3rem]": selectedElement === "h2",
        "tw-text-[2.5rem]": selectedElement === "h3",
        "tw-text-[2rem]": selectedElement === "h4",
        "tw-text-[1.5rem]": selectedElement === "subtitle-1",
        "tw-text-[1.25rem]": selectedElement === "subtitle-2",
        "tw-text-[1rem]": selectedElement === "body",
        "tw-text-[0.875rem]": selectedElement === "caption",
        "tw-text-[0.75rem]": selectedElement === "tiny-text",
        "tw-font-bold": selectedWeight === "bold",
        "tw-font-semibold": selectedWeight === "semibold",
        "tw-font-medium": selectedWeight === "medium",
        "tw-font-normal": selectedWeight === "regular",
      },
      className
    ),
    ...props,
  });
};
