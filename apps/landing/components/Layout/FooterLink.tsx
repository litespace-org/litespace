"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterLink({ route, title }: { route: string; title: string }) {
  const pathName = usePathname();

  return (
    <Link
      href={route}
      className={`p-1 w-fit rounded hover:underline duration-300 transition-all focus-within:outline outline-[.5px] outline-natural-50 ${pathName === route && "text-brand-500"}`}
    >
      <h5 className="text-natural-100 text-sm leading-[21px]">{title}</h5>
    </Link>
  );
}
