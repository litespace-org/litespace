import { Route } from "next";
import Link from "@/components/Common/Link";
import cn from "classnames";

export function FooterLink({ route, text }: { route: Route; text: string }) {
  return (
    <Link
      href={route}
      className={cn(
        "p-1 w-fit rounded hover:underline text-natural-100 text-caption  active:text-brand-500",
        "leading-[21px] duration-300 transition-all focus-visible:outline outline-[.5px] outline-natural-50"
      )}
      track={{
        event: "navigation",
        params: {
          route,
          label: text,
          src: "footer",
        },
      }}
    >
      {text}
    </Link>
  );
}
