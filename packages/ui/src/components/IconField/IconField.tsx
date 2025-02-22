import { Icon } from "react-feather";
import cn from "classnames";

export const Field: React.FC<{
  Icon: Icon;
  children: React.ReactNode;
  className?: string;
}> = ({ Icon, children, className }) => {
  return (
    <li
      className={cn("tw-flex tw-flex-row tw-items-center tw-gap-2", className)}
    >
      <div>
        <Icon className="tw-w-5 tw-h-5 md:tw-w-6 md:tw-h-6" />
      </div>
      <p className="tw-text-caption md:tw-text-base">{children}</p>
    </li>
  );
};
