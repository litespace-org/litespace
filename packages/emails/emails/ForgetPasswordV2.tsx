import Typography from "@/components/Common/TypographyV2";
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";
import Template from "@/components/Layout/TemplateV2";
import { translate } from "@/components/Common/Translate";
import { Container, Section } from "@react-email/components";
import * as React from "react";
import Link from "@/components/Common/Link";

export function ForgetPasswordV2({ code }: { code: number }) {
  return (
    <Template preview={translate.string("forget-password-email.preview")}>
      <Header />

      <Section className="mt-[46px] text-center">
        <Typography element="h4" weight="bold" text="natural-950">
          {translate("forget-password-email.title")}
        </Typography>
      </Section>

      <Section className="max-w-[456px] mt-[24px] text-center">
        <Typography element="body" text="natural-700">
          {translate("forget-password-email.desc.v2", {
            link: (
              <Link href="https://litespace.org/" key="link">
                {translate.string("labels.litespace")}
              </Link>
            ),
          })}
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

      <Section className="mt-[64px]">
        <Footer />
      </Section>
    </Template>
  );
}

export default ForgetPasswordV2;
