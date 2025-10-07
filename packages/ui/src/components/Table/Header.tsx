import { MemoExoticComponent, SVGProps } from "react";
import { Typography } from "@/components/Typography";

export const Header: React.FC<{
  Icon?: MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => React.ReactNode
  >;
  label: string;
}> = ({ Icon, label }) => {
  return (
    <div className="flex flex-row gap-[10px]">
      {Icon ? <Icon className="w-6 h-6 [&>*]:stroke-natural-950" /> : null}
      <Typography tag="span" className="text-body text-natural-950 font-bold">
        {label}
      </Typography>
    </div>
  );
};
