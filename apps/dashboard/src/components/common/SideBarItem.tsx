import { NavOption } from "@/types/navbar";
import { Button, ButtonSize, ButtonType } from "@litespace/luna";
import { Link } from "react-router-dom";
import cn from "classnames";
import { Void } from "@litespace/types";

function SideBarItem({
  option,
  onClick,
}: {
  option: NavOption;
  onClick?: Void;
}) {
  return (
    <li key={option.label} className="w-full">
      <Link to={option.route} onClick={onClick} className="w-full inline-block">
        <Button
          onClick={option.onClick}
          loading={option.loading}
          disabled={option.disabled}
          className={cn(
            "!w-full [&>div]:w-full [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:justify-start [&>div]:text-lg",
            location.pathname === option.route && "bg-surface-200"
          )}
          size={ButtonSize.Small}
          type={ButtonType.Text}
        >
          <option.icon className="w-7 h-7" />
          {option.label}
        </Button>
      </Link>
    </li>
  );
}

export default SideBarItem;
