import {
  Body,
  Font,
  Head,
  Html,
  Preview,
  Section,
} from "@react-email/components";
import React from "react";
import Card from "@/components/Common/CardV2";
import Tailwind from "@/components/Tailwind";

const Template: React.FC<{ preview: string; children?: React.ReactNode }> = ({
  preview,
  children,
}) => {
  return (
    <Tailwind>
      <Html lang="ar-eg" dir="rtl">
        <Head>
          <Font
            fontFamily="Cairo"
            fallbackFontFamily={["Arial", "sans-serif"]}
            webFont={{
              url: "https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-a1biLC2CikE0n8H9.woff2",
              format: "woff2",
            }}
          />
          <Preview>{preview}</Preview>
        </Head>
        <Body
          style={{ direction: "rtl", fontFamily: "Cairo, Arial" }}
          className="[&_*]:p-0 [&_*]:m-0 [&_*]:border-box bg-natural-50 h-full w-full bg-natural-50 w-full h-full"
        >
          <Section className="h-[72px]" />
          <Card>{children}</Card>
          <Section className="h-[72px]" />
        </Body>
      </Html>
    </Tailwind>
  );
};

export default Template;
