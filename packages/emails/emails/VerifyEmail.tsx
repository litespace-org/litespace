import * as React from "react";
import Header from "@/components/Layout/Header";
import Template from "@/components/Layout/Template";
import Typography from "@/components/Common/Typography";
import { translate } from "@/components/Common/Translate";
import { Container, Section } from "@react-email/components";
import Footer from "@/components/Layout/Footer";

export function VerifyEmail({ code }: { code: number }) {
  return (
    <Template preview={translate.string("verify-email.preview")}>
      <Header />

      <Section className="max-w-[312px] mt-[46px] text-center">
        <Typography element="h4" weight="bold" text="natural-950">
          {translate.string("verify-email.title")}
        </Typography>
      </Section>

      <Section className="max-w-[456px] mt-[24px] text-center">
        <Typography element="body" text="natural-700">
          {translate.string("verify-email.desc")}
        </Typography>
      </Section>

      <Container>
        <Section className="mt-[48px] text-center">
          <Typography
            element="h3"
            weight="bold"
            text="natural-950"
            spacedBy={16}
          >
            {code}
          </Typography>
        </Section>
      </Container>

      <Section className="mt-[64px] mb-[0px] p-[0px]">
        <Footer />
      </Section>
    </Template>
  );
}
export default VerifyEmail;
