import Header from "@/components/Header";
import Tailwind from "@/components/Tailwind";
import Card from "@/components/common/Card";
import Typography from "@/components/common/Typography";
import localId from "@/locales/ar-eg.json";
import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Link,
} from "@react-email/components";
import * as React from "react";

export function VerifyEmail({
  emailUrl,
  commonQuestionsUrl,
}: {
  emailUrl: string;
  commonQuestionsUrl: string;
}) {
  return (
    <Html lang="en" dir="rtl" className="[&>*]:p-0 [&>*]:m-0 [&>*]:box-border">
      <Tailwind>
        <Head>
          <Font
            fontFamily="Cairo"
            fallbackFontFamily={["Arial", "sans-serif"]}
            webFont={{
              url: "https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap",
              format: "woff2",
            }}
          />
        </Head>
        <Body style={{ fontFamily: "Cairo, Arial, sans-serif" }}>
          <Card>
            <Header />
            <Typography
              element="h4"
              weight="bold"
              className="text-natural-950 mt-[46px] mb-6"
            >
              {localId["verification.title"]}
            </Typography>
            <Typography
              element="body"
              weight="regular"
              className="text-natural-700 mb-[48px]"
            >
              {localId["paragraph-1"]}
            </Typography>
            <Button
              href={emailUrl}
              style={{ cursor: "pointer" }}
              className="px-[2rem] py-[1rem] bg-brand-700 rounded-[8px] mb-16 hover:cursor-pointer"
            >
              <Typography
                element="body"
                weight="bold"
                className="text-natural-50 p-0 m-0"
              >
                {localId["email.confirm"]}
              </Typography>
            </Button>
            <Container>
              <Typography
                element="body"
                weight="regular"
                inline
                className="text-natural-950"
              >
                {localId["paragraph-2"][0]}
              </Typography>
              <Typography
                element="body"
                weight="regular"
                inline
                className="text-natural-700"
              >
                {localId["paragraph-2"][1]}
              </Typography>
              <Link href={commonQuestionsUrl} className="inline">
                <Typography
                  element="body"
                  weight="regular"
                  inline
                  className="text-brand-700"
                >
                  {localId["common-questions"]}
                </Typography>
              </Link>
              <Typography
                element="body"
                weight="regular"
                inline
                className="text-natural-700"
              >
                {localId["paragraph-2"][2]}
              </Typography>
              <Link href="mailto:care@litespace.org" className="inline">
                <Typography
                  element="body"
                  weight="regular"
                  inline
                  className="text-brand-700 inline"
                >
                  care@litespace.org
                </Typography>
              </Link>
              <Typography
                element="body"
                weight="regular"
                inline
                className="text-natural-700 inline"
              >
                {localId["paragraph-2"][3]}
              </Typography>
            </Container>
            <Hr className="w-[214px] h-[1px] my-6 bg-natural-700" />
            <Typography
              element="body"
              weight="regular"
              className="text-natural-700"
            >
              {localId["paragraph-3"]}
            </Typography>
          </Card>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default VerifyEmail;
