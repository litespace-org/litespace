import { SVGProps } from "react";

export type Icon = React.MemoExoticComponent<
  (props: SVGProps<SVGSVGElement>) => JSX.Element
>;
