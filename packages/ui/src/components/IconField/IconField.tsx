import { Icon } from "react-feather";
import cn from "classnames";

export const Field: React.FC<{
  Icon: Icon;
  children: React.ReactNode;
  className?: string;
}> = ({ Icon, children, className }) => {
  return (
    <li className={cn("flex flex-row items-center gap-2", className)}>
      <div>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <p className="text-caption md:text-base">{children}</p>
    </li>
  );
};
