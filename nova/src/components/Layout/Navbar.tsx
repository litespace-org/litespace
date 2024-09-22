import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  Discord,
  Switch,
  useFormatMessage,
} from "@litespace/luna";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { IUser } from "@litespace/types";
import { Route } from "@/types/routes";
import { Link, useLocation } from "react-router-dom";
import cn from "classnames";

enum Theme {
  Light = "light",
  Dark = "dark",
}

const KEY = "litespace::theme";

function getCurrentTheme(): Theme {
  const theme = localStorage.getItem(KEY);
  if (theme === Theme.Light || theme === Theme.Dark) return theme;
  return Theme.Light;
}

function setCurrentTheme(theme: Theme): Theme {
  localStorage.setItem(KEY, theme);
  return theme;
}

const Navbar: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelector);
  const location = useLocation();
  const [theme, setTheme] = useState<Theme | null>(null);

  const toggleTheme = useCallback(() => {
    const to = theme === Theme.Light ? Theme.Dark : Theme.Light;
    setTheme(setCurrentTheme(to));
  }, [theme]);

  useEffect(() => {
    if (theme === Theme.Dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  const links = useMemo(() => {
    const student = profile?.role === IUser.Role.Student;
    if (student)
      return [
        {
          label: intl("navbar.lessons"),
          route: Route.Lessons,
        },
        {
          label: intl("navbar.tutors"),
          route: Route.Tutors,
        },
        {
          label: intl("navbar.subscription"),
          route: Route.Subscription,
        },
        {
          label: intl("navbar.settings"),
          route: Route.Settings,
        },
      ];

    return [];
  }, [intl, profile]);

  return (
    <nav className="px-6 py-4 flex flex-row items-center gap-6 border-b border-border-overlay">
      <Discord className="fill-foreground h-6 w-6" />

      <ul className="flex flex-row gap-4">
        {links.map((link) => {
          return (
            <li key={link.label}>
              <Link to={link.route}>
                <Button
                  className={cn(
                    location.pathname === link.route && "bg-surface-200"
                  )}
                  size={ButtonSize.Small}
                  type={ButtonType.Text}
                >
                  {link.label}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mr-auto">
        <Switch onChange={toggleTheme} />
      </div>
    </nav>
  );
};

export default Navbar;
