import React, { ComponentProps } from "react";
import cn from "classnames";

type Tag = keyof JSX.IntrinsicElements;

type Props<T extends Tag> = {
  tag: T;
  children?: React.ReactNode;
  className?: string;
} & ComponentProps<T>;

export const Typography = <T extends Tag>({
  tag,
  children,
  className,
  ...props
}: Props<T>) => {
  return React.createElement(tag, {
    children,
    className: cn("tw-font-cairo tw-leading-[150%]", className),
    ...props,
  });
};
