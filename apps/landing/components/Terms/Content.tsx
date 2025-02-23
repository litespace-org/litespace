// TODO: convert this component to server component once the Typography task is done
"use client";

import React from "react";
import cn from "classnames";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import { SocialLinks } from "@/components/common/SocialLinks";
import { BulletList } from "@/components/common/BulletList";
import { NumberedList } from "@/components/common/NumberedList";

const Content: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "flex flex-col py-14 sm:py-20 md:py-20 px-4 md:px-8 lg:px-[108px] gap-14 sm:gap-20",
        "max-w-screen-3xl mx-auto w-full"
      )}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/policies-updates/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/policies-updates/content/1")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/policies-updates/content/2")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/account-register/title")}
        </Typography>

        <BulletList
          items={[
            intl("terms/body/account-register/content/1"),
            intl("terms/body/account-register/content/2"),
            intl("terms/body/account-register/content/3"),
            intl("terms/body/account-register/content/4"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/privacy-and-protection/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/privacy-and-protection/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/payment-and-subscription/title")}
        </Typography>

        <BulletList
          items={[
            intl("terms/body/payment-and-subscription/content/1"),
            intl("terms/body/payment-and-subscription/content/2"),
            intl("terms/body/payment-and-subscription/content/3"),
            intl("terms/body/payment-and-subscription/content/4"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/refund-policy/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/refund-policy/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/booking-steps/title")}
        </Typography>

        <NumberedList
          items={[
            intl("terms/body/booking-steps/content/1"),
            intl("terms/body/booking-steps/content/2"),
            intl("terms/body/booking-steps/content/3"),
            intl("terms/body/booking-steps/content/4"),
            intl("terms/body/booking-steps/content/5"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/required-permissions/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/required-permissions/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/conversations/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/conversations/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/rating-tutors/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/rating-tutors/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/contact-us/title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/contact-us/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("terms/body/contact-us/email/1")}
          </Typography>
          <Typography
            tag="h3"
            weight="medium"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("terms/body/contact-us/email/2")}
          </Typography>
        </div>

        <div className="flex flex-row gap-2">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("terms/body/contact-us/phone/1")}
          </Typography>
          <Typography
            tag="h3"
            weight="medium"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("terms/body/contact-us/phone/2")}
          </Typography>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("terms/body/contact-us/social-media")}
          </Typography>

          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default Content;
