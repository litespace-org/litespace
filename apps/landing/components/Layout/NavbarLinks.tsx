import { PAGES } from "@/constants/ui";
import { useFormatMessage } from "@/hooks/intl";
import Logo from "@litespace/assets/Logo";
import Menu from "@litespace/assets/Menu";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import Link from "next/link";
import cn from "classnames";
import { Void } from "@litespace/types";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { track } from "@/lib/ga";

export function NavbarLinks({ toggleSidebar }: { toggleSidebar: Void }) {
  const intl = useFormatMessage();

  return (
    <div className="max-w-screen-3xl mx-auto flex flex-row-reverse lg:flex-row justify-between items-center py-6 lg:py-4 px-4 md:px-8">
      <Logo className="w-6 h-6 lg:w-10 lg:h-10 lg:me-20" />
      <nav
        className={cn("hidden lg:flex flex-col lg:flex-row gap-8 items-center")}
      >
        {PAGES.map((page) => (
          <Link
            href={page.route}
            key={page.route}
            onClick={() => {
              track("navigation", {
                action: "link",
                route: page.route,
                src: "navbar",
              });
            }}
          >
            <Typography
              tag="span"
              className={cn(
                "transition-colors duration-300 text-caption font-semibold text-natural-950"
              )}
            >
              {intl(page.title)}
            </Typography>
          </Link>
        ))}
      </nav>
      <div className="hidden lg:flex ms-auto gap-4 min-w-[304px]">
        <Link
          href={router.web({
            route: Web.Register,
            role: "student",
            full: true,
          })}
          className="max-w-[134px] lg:max-w-[144px] flex-1"
          onClick={() => {
            track("register", { action: "link", src: "navbar" });
          }}
        >
          <Button size="large" className="w-full">
            <Typography
              tag="span"
              className="text-natural-50 text-body font-semibold"
            >
              {intl("navbar/register")}
            </Typography>
          </Button>
        </Link>
        <Link
          href={router.web({ route: Web.Login, full: true })}
          className="max-w-[134px] lg:max-w-[144px] flex-1"
          onClick={() => {
            track("register", { action: "link", src: "navbar" });
          }}
        >
          <Button
            size="large"
            variant="secondary"
            className="w-full !bg-natural-0"
          >
            <Typography
              tag="span"
              className="text-brand-700 text-body font-semibold"
            >
              {intl("navbar/login")}
            </Typography>
          </Button>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => {
          toggleSidebar();
          track("toggle_nav_menu", {
            action: "button",
            src: "navbar",
          });
        }}
        className="lg:hidden w-6 h-6 bg-natural-100 bg-opacity-50 rounded-[4px] p-[2px]"
      >
        <Menu />
      </button>
    </div>
  );
}
