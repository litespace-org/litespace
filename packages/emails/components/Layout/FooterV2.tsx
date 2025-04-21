import React from "react";
import { Section, Hr } from "@react-email/components";
import Typography from "@/components/Common/TypographyV2";
import { translate } from "@/components/Common/Translate";
import Link from "@/components/Common/Link";

const Footer: React.FC = () => {
  return (
    <Section className="text-center max-w-[456px]">
      <Typography element="body" text="natural-950">
        {translate("footer.content", {
          faq: (
            <Link key="faq" href="https://litespace.org/faq">
              {translate.string("footer.faq")}
            </Link>
          ),
          email: (
            <Link key="email" href="mailto:care@litespace.org">
              care@litespace.org
            </Link>
          ),
        })}
      </Typography>
      <Hr className="bg-natural-700 border-natural-700 h-[1px] max-w-[214px] mx-auto my-[24px]" />
      <Section className="text-center my-[24px]">
        <Typography element="body" text="natural-700">
          {translate.string("footer.note-1")}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate.string("footer.note-2", {
            year: new Date().getFullYear(),
          })}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate.string("footer.note-3")}
        </Typography>
      </Section>
    </Section>
  );
};

export default Footer;
