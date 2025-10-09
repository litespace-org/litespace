import { Route } from "next";
import Link from "@/components/Common/Link";
import cn from "classnames";
import { Typography } from "@litespace/ui/Typography";

export function FooterLink({ route, text }: { route: Route; text: string }) {
  return (
    <Link
      href={route}
      className={cn(
        "w-fit rounded group",
        "duration-300 transition-all focus-visible:outline-none ring-offset-2 focus-visible:ring-1 ring-brand-500"
      )}
    >
      <Typography
        tag="span"
        className="text-natural-600 text-caption group-active:text-brand-500 group-hover:underline"
      >
        {text}
      </Typography>
    </Link>
  );
}
