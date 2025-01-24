import * as React from "react";
import Header from "@/components/Layout/Header";
import Template from "@/components/Layout/Template";
import Typography from "@/components/Common/Typography";
import { translate } from "@/lib/translate";
import { Container, Section } from "@react-email/components";
import Button from "@/components/Common/Button";
import Footer from "@/components/Layout/Footer";

export function VerifyEmail({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Template preview={translate("verify-email.title")}>
      <Header />

      <Section className="w-[312px] mt-[46px] text-center">
        <Typography element="h4" weight="bold" text="natural-950">
          {translate("verify-email.title")}
        </Typography>
      </Section>

      <Section className="w-[456px] mt-[24px] text-center">
        <Typography element="body" weight="bold" text="natural-700">
          {translate("verify-email.desc")}
        </Typography>
      </Section>

      <Container>
        <Section className="mt-[48px] text-center">
          <Button href={redirectUrl}>
            <Typography element="body" weight="bold" text="natural-50">
              {translate("verify-email.confirm")}
            </Typography>
          </Button>
        </Section>
      </Container>

      <Section className="mt-[64px]">
        <Footer />
      </Section>
    </Template>
  );
}

export default VerifyEmail;
