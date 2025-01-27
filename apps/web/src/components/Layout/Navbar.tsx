import { useUserContext } from "@litespace/headless/context/user";
import { ProfileInfo } from "@litespace/ui/Navbar";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import cn from "classnames";
import { Route } from "@/types/routes";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Crown from "@litespace/assets/Crown";
import { IUser } from "@litespace/types";
import { Button, ButtonSize } from "@litespace/ui/Button";

const Navbar: React.FC = () => {
  const intl = useFormatMessage();
  const { user } = useUserContext();
  const location = useLocation();

  if (!user) return null;
  return (
    <div className="shadow-app-navbar w-full z-navbar">
      <div
        className={cn("flex justify-between gap-8 items-center p-6", {
          "max-w-screen-3xl mx-auto": location.pathname !== Route.Chat,
        })}
      >
        {user.role === IUser.Role.Student &&
        location.pathname !== Route.Subscription ? (
          <Link to={Route.Subscription}>
            <Button
              size={ButtonSize.Large}
              htmlType="button"
              endIcon={<Crown height={24} width={24} />}
            >
              <Typography
                element="body"
                weight="bold"
                className="text-natural-50"
              >
                {intl("navbar.subscribe-now")}
              </Typography>
            </Button>
          </Link>
        ) : null}
        <div className="mr-auto">
          <ProfileInfo
            imageUrl={user.image}
            name={user.name}
            email={user.email}
            id={user.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
