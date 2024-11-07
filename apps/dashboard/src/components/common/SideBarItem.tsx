import { NavOption } from "@/types/navbar";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
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
      <Link to={option.route} onClick={onClick} className="inline-block w-full">
        <Button
          onClick={option.onClick}
          loading={option.loading}
          disabled={option.disabled}
          className={cn(
            "w-full [&>div]:w-full",
            location.pathname === option.route && "bg-surface-200"
          )}
          size={ButtonSize.Small}
          type={ButtonType.Main}
          variant={ButtonVariant.Secondary}
        >
          <div className="flex items-center justify-start w-full gap-2">
            <option.icon className="w-6 h-6" />
            <p className="truncate">{option.label}</p>
          </div>
        </Button>
      </Link>
    </li>
  );
}

export default SideBarItem;
