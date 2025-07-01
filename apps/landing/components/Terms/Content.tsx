import React from "react";
import cn from "classnames";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { SocialLinks } from "@/components/Common/SocialLinks";
import { BulletList } from "@/components/Common/BulletList";
import { NumberedList } from "@/components/Common/NumberedList";
import { Section, Text, Title } from "@/components/Layout/Section";

const Content: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "flex flex-col py-14 sm:py-20 md:py-20 px-4 md:px-8 lg:px-[108px] gap-14 sm:gap-20",
        "max-w-screen-3xl mx-auto w-full"
      )}
    >
      <Section>
        <Title id="terms/body/policies-updates/title" />
        <Text id="terms/body/policies-updates/content/1" />
        <Text id="terms/body/policies-updates/content/2" />
      </Section>

      <Section>
        <Title id="terms/body/account-register/title" />

        <BulletList
          items={[
            intl("terms/body/account-register/content/1"),
            intl("terms/body/account-register/content/2"),
            intl("terms/body/account-register/content/3"),
            intl("terms/body/account-register/content/4"),
          ]}
        />
      </Section>

      <Section>
        <Title id="terms/body/privacy-and-protection/title" />
        <Text id="terms/body/privacy-and-protection/content" />
      </Section>

      <Section>
        <Title id="terms/body/payment-and-subscription/title" />

        <BulletList
          items={[
            intl("terms/body/payment-and-subscription/content/1"),
            intl("terms/body/payment-and-subscription/content/2"),
            intl("terms/body/payment-and-subscription/content/3"),
            intl("terms/body/payment-and-subscription/content/4"),
            intl("terms/body/payment-and-subscription/content/5"),
            intl("terms/body/payment-and-subscription/content/6"),
          ]}
        />
      </Section>

      <Section>
        <Title id="terms/body/refund-policy/title" />
        <Text id="terms/body/refund-policy/content" />
      </Section>

      <Section>
        <Title id="terms/body/booking-steps/title" />

        <NumberedList
          items={[
            intl("terms/body/booking-steps/content/1"),
            intl("terms/body/booking-steps/content/2"),
            intl("terms/body/booking-steps/content/3"),
            intl("terms/body/booking-steps/content/4"),
            intl("terms/body/booking-steps/content/5"),
          ]}
        />
      </Section>

      <Section>
        <Title id="terms/body/required-permissions/title" />
        <Text id="terms/body/required-permissions/content" />
      </Section>

      <Section>
        <Title id="terms/body/conversations/title" />
        <Text id="terms/body/required-permissions/content" />
      </Section>

      <Section>
        <Title id="terms/body/rating-tutors/title" />
        <Text id="terms/body/rating-tutors/content" />
      </Section>

      <Section>
        <Title id="terms/body/contact-us/title" />
        <Text id="terms/body/contact-us/content" />

        <div className="flex flex-row gap-2">
          <Typography
            tag="p"
            className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
          >
            {intl("terms/body/contact-us/email/1")}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
          >
            {intl("terms/body/contact-us/email/2")}
          </Typography>
        </div>

        <div className="flex flex-row gap-2">
          <Typography
            tag="p"
            className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
          >
            {intl("terms/body/contact-us/phone/1")}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
          >
            {intl("terms/body/contact-us/phone/2")}
          </Typography>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Typography
            tag="p"
            className="text-natural-950 text-body sm:text-subtitle-1 font-bold"
          >
            {intl("terms/body/contact-us/social-media")}
          </Typography>

          <SocialLinks />
        </div>
      </Section>
    </div>
  );
};

export default Content;
