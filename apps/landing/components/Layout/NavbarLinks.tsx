import { PAGES } from "@/constants/ui";
import { useFormatMessage } from "@/hooks/intl";
import Logo from "@litespace/assets/Logo";
import Menu from "@litespace/assets/Menu";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import Link from "next/link";
import cn from "classnames";
import { Void } from "@litespace/types";

export function NavbarLinks({
  scrolled,
  toggleSidebar,
}: {
  scrolled: boolean;
  toggleSidebar: Void;
}) {
  const intl = useFormatMessage();

  return (
    <div className="max-w-screen-3xl mx-auto flex flex-row-reverse lg:flex-row justify-between items-center py-6 lg:py-4 px-4 md:px-8">
      <Logo className="w-6 h-6 lg:w-10 lg:h-10 lg:me-20" />
      <nav
        className={cn("hidden lg:flex flex-col lg:flex-row gap-8 items-center")}
      >
        {PAGES.map((page) => (
          <Link href={page.route} key={page.route}>
            <Typography
              element="caption"
              weight="semibold"
              className={cn(
                "transition-colors duration-300",
                scrolled ? "text-natural-950" : "text-natural-50"
              )}
            >
              {intl(page.title)}
            </Typography>
          </Link>
        ))}
      </nav>
      <div className="hidden lg:flex ms-auto gap-4 min-w-[304px]">
        <Link
          href="https://app.litespace.org/register/stundent"
          className="max-w-[134px] lg:max-w-[144px] flex-1"
        >
          <Button size="large" className="w-full">
            <Typography
              element="body"
              weight="semibold"
              className="text-natural-50"
            >
              {intl("navbar/register")}
            </Typography>
          </Button>
        </Link>
        <Link
          href="https://app.litespace.org/login"
          className="max-w-[134px] lg:max-w-[144px] flex-1"
        >
          <Button size="large" variant="secondary" className="w-full">
            <Typography
              element="body"
              weight="semibold"
              className="text-brand-700"
            >
              {intl("navbar/login")}
            </Typography>
          </Button>
        </Link>
      </div>
      <button
        type="button"
        onClick={toggleSidebar}
        className="lg:hidden w-6 h-6 bg-natural-100 bg-opacity-50 rounded-[4px] p-[2px]"
      >
        <Menu />
      </button>
    </div>
  );
}
