import type { Metadata } from "next";
import React from "react";
import Body from "@/components/Layout/Body";

import "@litespace/ui/style.css";
import "@litespace/ui/tailwind.css";

export const metadata: Metadata = {
  title: "LiteSpace",
  description: "Effortless English learning!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="scrollbar-thin bg-natural-50 font-cairo relative"
    >
      <Body>{children}</Body>
    </html>
  );
}
