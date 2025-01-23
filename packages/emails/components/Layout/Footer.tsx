import { Section, Hr } from "@react-email/components";
import React from "react";
import Typography from "@/components/Common/Typography";
import { translate } from "@/lib/translate";

const Footer: React.FC = () => {
  return (
    <Section className="w-[456px]">
      <Section className="text-center">
        <Typography element="body" text="natural-950">
          {translate("footer.help")}
        </Typography>
      </Section>

      <Hr className="bg-natural-700 h-[1px] w-[214px] mx-auto my-[24px]" />

      <Section className="text-center">
        <Typography element="body" text="natural-700">
          {translate("footer.note-1")}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate("footer.note-2")}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate("footer.note-3", {
            year: new Date().getFullYear(),
          })}
        </Typography>
      </Section>
    </Section>
  );
};

export default Footer;
