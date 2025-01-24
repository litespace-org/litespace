import Button from "@/components/Common/Button";
import Typography from "@/components/Common/Typography";
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";
import Template from "@/components/Layout/Template";
import { translate } from "@/lib/translate";
import { Container, Section } from "@react-email/components";
import * as React from "react";

export function ForgetPassword({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Template preview={translate("forget-password-email.title")}>
      <Header />

      <Section className="mt-[46px] text-center">
        <Typography element="h4" weight="bold" text="natural-950">
          {translate("forget-password-email.title")}
        </Typography>
      </Section>

      <Section className="w-[456px] mt-[24px] text-center">
        <Typography element="body" weight="bold" text="natural-700">
          {translate("forget-password-email.desc")}
        </Typography>
      </Section>

      <Container>
        <Section className="mt-[48px] text-center">
          <Button href={redirectUrl}>
            <Typography element="body" weight="bold" text="natural-50">
              {translate("forget-password-email.confirm")}
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

export default ForgetPassword;
