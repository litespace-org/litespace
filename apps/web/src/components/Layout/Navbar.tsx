import { useUserContext } from "@litespace/headless/context/user";
import { ProfileInfo } from "@litespace/ui/Navbar";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Crown from "@litespace/assets/Crown";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import Menu from "@litespace/assets/Menu";
import { Web } from "@litespace/utils/routes";

const Navbar: React.FC<{ toggleSidebar: Void }> = ({ toggleSidebar }) => {
  const { lg } = useMediaQuery();
  const intl = useFormatMessage();
  const { user } = useUserContext();
  const location = useLocation();

  if (!user) return null;
  return (
    <div className="shadow-app-navbar lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50">
      <div
        className={cn("flex justify-between gap-8 items-center py-6 px-4", {
          "max-w-screen-3xl mx-auto": location.pathname !== Web.Chat,
        })}
      >
        {user.role === IUser.Role.Student &&
        location.pathname !== Web.Subscription &&
        lg ? (
          <Link to={Web.Subscription}>
            <Button
              size="large"
              htmlType="button"
              endIcon={<Crown height={16} width={16} />}
            >
              <Typography
                tag="span"
                className="text-natural-50 text-body font-bold"
              >
                {intl("navbar.subscribe-now")}
              </Typography>
            </Button>
          </Link>
        ) : null}

        {!lg ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-6 h-6 bg-natural-100 bg-opacity-50 rounded-[4px] p-[2px]"
          >
            <Menu />
          </button>
        ) : null}

        <div className="ms-auto">
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
