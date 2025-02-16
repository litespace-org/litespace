import type { Metadata } from "next";
import React from "react";
import Layout from "@/components/Layout/Layout";

import "@litespace/ui/style.css";
import "@litespace/ui/tailwind.css";
import { getLocale } from "next-intl/server";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "LiteSpace",
  description: "Effortless English learning!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale.startsWith("ar") ? "ar" : "en"}
      dir={locale.startsWith("ar") ? "rtl" : "ltr"}
      className="scrollbar-thin bg-natural-50 font-cairo relative"
    >
      <NextIntlClientProvider messages={messages}>
        <Layout>{children}</Layout>
      </NextIntlClientProvider>
    </html>
  );
}
