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
import { Typography } from "@litespace/luna/Typography";

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
          className={cn("w-full [&>div]:w-full")}
          size={ButtonSize.Small}
          type={ButtonType.Main}
          variant={
            location.pathname === option.route
              ? ButtonVariant.Primary
              : ButtonVariant.Tertiary
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
