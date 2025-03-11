import { useUserContext } from "@litespace/headless/context/user";
import { ProfileInfo } from "@litespace/ui/Navbar";
import React from "react";
import { Link } from "react-router-dom";
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
  const { md, lg } = useMediaQuery();
  const intl = useFormatMessage();
  const { user } = useUserContext();

  if (!user) return null;
  return (
    <div className="shadow-app-navbar shadow lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50">
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

        {!md ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-6 h-6 bg-brand-700 bg-opacity-50 rounded-[4px] p-[2px]"
          >
            <Menu className="[&>*]:stroke-natural-50" />
          </button>
        ) : null}

        <div className="ms-auto">
          {user ? (
            <ProfileInfo
              imageUrl={user.image}
              name={user.name}
              email={user.email}
              id={user.id}
            />
          ) : null}

          {!user ? (
            <div className="flex gap-2">
              <Link to={Web.Register}>
                <Button size="large">
                  <Typography
                    tag="body"
                    className="text-body text-natural-50 font-medium"
                  >
                    {intl("navbar.register")}
                  </Typography>
                </Button>
              </Link>
              <Link to={Web.Login}>
                <Button size="large" variant="secondary">
                  <Typography
                    tag="body"
                    className="text-body text-brand-700 font-medium"
                  >
                    {intl("navbar.login")}
                  </Typography>
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
