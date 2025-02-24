import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { SocialLinks } from "@/components/Common/SocialLinks";
import { BulletList } from "@/components/Common/BulletList";
import { Title, Text, Section } from "@/components/Layout/Section";
import cn from "classnames";

const Content: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "flex flex-col py-14 sm:py-20 px-4 md:px-8 lg:px-[108px] gap-14 sm:gap-20",
        "max-w-screen-3xl mx-auto w-full"
      )}
    >
      <Section>
        <Title id="privacy-policy/body/all-data/title" />
        <Text id="privacy-policy/body/all-data/content/1" />
        <BulletList
          items={[
            intl("privacy-policy/body/all-data/content/2"),
            intl("privacy-policy/body/all-data/content/3"),
            intl("privacy-policy/body/all-data/content/4"),
            intl("privacy-policy/body/all-data/content/5"),
          ]}
        />
      </Section>

      <Section>
        <Title id="privacy-policy/body/data-usage/title" />
        <Text id="privacy-policy/body/data-usage/content/1" />
        <BulletList
          items={[
            intl("privacy-policy/body/data-usage/content/2"),
            intl("privacy-policy/body/data-usage/content/3"),
            intl("privacy-policy/body/data-usage/content/4"),
            intl("privacy-policy/body/data-usage/content/5"),
            intl("privacy-policy/body/data-usage/content/6"),
            intl("privacy-policy/body/data-usage/content/7"),
          ]}
        />
      </Section>

      <Section>
        <Title id="privacy-policy/body/share-data/title" />
        <Text id="privacy-policy/body/share-data/content/1" />
        <BulletList
          items={[
            intl("privacy-policy/body/share-data/content/2"),
            intl("privacy-policy/body/share-data/content/3"),
          ]}
        />
      </Section>

      <Section>
        <Title id="privacy-policy/body/data-protection/title" />
        <Text id="privacy-policy/body/data-protection/content/1" />
        <BulletList
          items={[
            intl("privacy-policy/body/data-protection/content/2"),
            intl("privacy-policy/body/data-protection/content/3"),
            intl("privacy-policy/body/data-protection/content/4"),
          ]}
        />
      </Section>

      <Section>
        <Title id="privacy-policy/body/subscriber-rights/title" />
        <Text id="privacy-policy/body/subscriber-rights/content/1" />
        <BulletList
          items={[
            intl("privacy-policy/body/subscriber-rights/content/2"),
            intl("privacy-policy/body/subscriber-rights/content/3"),
            intl("privacy-policy/body/subscriber-rights/content/4"),
            intl("privacy-policy/body/subscriber-rights/content/5"),
          ]}
        />
      </Section>

      <Section>
        <Title id="privacy-policy/body/cookies/title" />
        <Text id="privacy-policy/body/cookies/content" />
      </Section>

      <Section>
        <Title id="privacy-policy/body/updates/title" />
        <Text id="privacy-policy/body/updates/content/1" />
        <Typography
          tag="p"
          className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
        >
          {intl("privacy-policy/body/updates/content/2")}
        </Typography>
      </Section>

      <Section>
        <Title id="privacy-policy/body/contact-us/title" />
        <Text id="privacy-policy/body/contact-us/content" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2">
            <Typography
              tag="p"
              className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
            >
              {intl("privacy-policy/body/contact-us/email/1")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
            >
              {intl("privacy-policy/body/contact-us/email/2")}
            </Typography>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Typography
              tag="p"
              className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
            >
              {intl("privacy-policy/body/contact-us/phone/1")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
            >
              {intl("privacy-policy/body/contact-us/phone/2")}
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <Typography
              tag="p"
              className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
            >
              {intl("privacy-policy/body/contact-us/social-media")}
            </Typography>

            <SocialLinks />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Content;
