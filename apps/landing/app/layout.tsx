import type { Metadata } from "next";
import "@litespace/ui/style.css";
import "@litespace/ui/tailwind.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "LiteSpace",
  description: "Learn English with ease!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <Providers>{children}</Providers>
    </html>
  );
}
