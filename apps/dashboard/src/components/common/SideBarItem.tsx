import { NavOption } from "@/types/navbar";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Link } from "react-router-dom";
import { Void } from "@litespace/types";
import cn from "classnames";

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
            "w-full [&>div]:w-full",
            location.pathname === option.route && "bg-surface-200"
          )}
          size={ButtonSize.Small}
          type={ButtonType.Text}
        >
          <div className="flex items-center justify-start gap-2 w-full">
            <option.icon className="w-6 h-6" />
            <p className="truncate">{option.label}</p>
          </div>
        </Button>
      </Link>
    </li>
  );
}

export default SideBarItem;
