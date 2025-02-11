import { Section, Hr, Markdown } from "@react-email/components";
import React from "react";
import Typography from "@/components/Common/Typography";
import { translate } from "@/lib/translate";

// TODO: WE need to update the faq link from the landing page when it's deployed

const Footer: React.FC = () => {
  return (
    <Section className="max-w-[456px]">
      <Markdown
        markdownContainerStyles={{
          padding: 0,
          margin: 0,
        }}
        markdownCustomStyles={{
          p: {
            color: "#4D4D4D",
            fontSize: "16px",
            lineHeight: "24px",
          },
          link: {
            color: "#4D4D4D",
            fontSize: "16px",
            lineHeight: "24px",
          },
        }}
      >
        {[
          `<span style="color:#0D0D0D;">${translate("footer.need-help")}</span>`,
          translate("footer.visit"),
          `<a target="_blank" href="https://litespace.org/faq" style="color:#1D7C4E; text-decoration:none;">
        ${translate("footer.faq")}
      </a>`,
          translate("footer.contact-email"),
          `<a target="_blank" href="mailto:support@litespace.com" style="color:#1D7C4E; text-decoration:none;">
        support@litespace.com،
      </a>`,
          translate("footer.answer"),
        ].join(" ")}
      </Markdown>

      <Hr className="bg-natural-700 border-natural-700 h-[1px] max-w-[214px] mx-auto my-[24px]" />

      <Section className="text-center my-[24px]">
        <Typography element="body" text="natural-700">
          {translate("footer.note-1")}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate("footer.note-2", {
            year: new Date().getFullYear(),
          })}
        </Typography>
        <Typography element="body" text="natural-700">
          {translate("footer.note-3")}
        </Typography>
      </Section>
    </Section>
  );
};

export default Footer;
