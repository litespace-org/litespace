import { Body, Head, Html, Preview } from "@react-email/components";
import React from "react";
import Card from "@/components/Common/Card";
import Tailwind from "@/components/Tailwind";

const Template: React.FC<{ preview: string; children?: React.ReactNode }> = ({
  preview,
  children,
}) => {
  return (
    <Html lang="ar-eg" dir="rtl">
      <Head>
        <Preview>{preview}</Preview>
      </Head>
      <Tailwind>
        <Body
          style={{ direction: "rtl", fontFamily: "Arial" }}
          className="[&_*]:p-0 [&_*]:m-0 [&_*]:border-box bg-natural-50 h-full w-full bg-natural-50"
        >
          <Card>{children}</Card>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Template;
