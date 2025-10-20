import type { Metadata } from "next";
import React from "react";
import Layout from "@/components/Layout/Layout";
import { getLocale } from "next-intl/server";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

import "@/lib/analytics/mixpanel";
import "@/lib/analytics/ga";
import "@/lib/clarity";
import "@litespace/ui/tailwind.css";

export const metadata: Metadata = {
  title: "LiteSpace — Effortless English",
  description:
    "تجربتك التعليمية عن بُعد والمصممة خصيصًا لمساعدتك في تطوير مهاراتك في اللغة الانجليزية وثقتك بنفسك من خلال جلسات خاصة تفاعلية مع معلمين تم اختيارهم بعناية فائقة.",
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
      className="scrollbar-thin bg-natural-0 font-cairo relative"
    >
      <NextIntlClientProvider messages={messages}>
        <Layout>{children}</Layout>
      </NextIntlClientProvider>
    </html>
  );
}
