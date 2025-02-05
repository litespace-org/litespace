import { NavOption } from "@/types/navbar";
import {
  Button,
} from "@litespace/ui/Button";
import { Link, useLocation } from "react-router-dom";
import { Void } from "@litespace/types";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";

function SideBarItem({
  option,
  onClick,
}: {
  option: NavOption;
  onClick?: Void;
}) {
  const location = useLocation();
  return (
    <li key={option.label} className="w-full">
      <Link to={option.route} onClick={onClick} className="inline-block w-full">
        <Button
          onClick={option.onClick}
          loading={option.loading}
          disabled={option.disabled}
          className={cn("w-full [&>div]:w-full")}
          size={"small"}
          type={"main"}
          variant={
            location.pathname === option.route
              ? "primary"
              : "tertiary"
          }
        >
          <div className="flex items-center justify-start w-full gap-2">
            <option.icon className="w-6 h-6" />
            <Typography element="body" className="truncate">
              {option.label}
            </Typography>
          </div>
        </Button>
      </Link>
    </li>
  );
}

export default SideBarItem;
