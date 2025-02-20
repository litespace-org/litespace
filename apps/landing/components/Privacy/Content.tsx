// TODO: convert this component to server component once the Typography task is done
"use client";

import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { SocialLinks } from "@/components/common/SocialLinks";
import { BulletList } from "@/components/common/BulletList";

const Content: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col py-14 sm:py-20 md:py-20 px-4 md:px-8 lg:px-[108px] gap-14 sm:gap-20">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/all-data/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/all-data/content/1")}
        </Typography>

        <BulletList
          items={[
            intl("privacy-policy/body/all-data/content/2"),
            intl("privacy-policy/body/all-data/content/3"),
            intl("privacy-policy/body/all-data/content/4"),
            intl("privacy-policy/body/all-data/content/5"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/data-usage/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/data-usage/content/1")}
        </Typography>

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
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/share-data/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/share-data/content/1")}
        </Typography>

        <BulletList
          items={[
            intl("privacy-policy/body/share-data/content/2"),
            intl("privacy-policy/body/share-data/content/3"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/data-protection/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/data-protection/content/1")}
        </Typography>

        <BulletList
          items={[
            intl("privacy-policy/body/data-protection/content/2"),
            intl("privacy-policy/body/data-protection/content/3"),
            intl("privacy-policy/body/data-protection/content/4"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/subscriber-rights/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/subscriber-rights/content/1")}
        </Typography>

        <BulletList
          items={[
            intl("privacy-policy/body/subscriber-rights/content/2"),
            intl("privacy-policy/body/subscriber-rights/content/3"),
            intl("privacy-policy/body/subscriber-rights/content/4"),
            intl("privacy-policy/body/subscriber-rights/content/5"),
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/cookies/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/cookies/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/updates/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/updates/content/1")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/updates/content/2")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("privacy-policy/body/contact-us/title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("privacy-policy/body/contact-us/content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("privacy-policy/body/contact-us/email/1")}
          </Typography>
          <Typography
            tag="h3"
            weight="medium"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("privacy-policy/body/contact-us/email/2")}
          </Typography>
        </div>

        <div className="flex flex-row gap-2">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("privacy-policy/body/contact-us/phone/1")}
          </Typography>
          <Typography
            tag="h3"
            weight="medium"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("privacy-policy/body/contact-us/phone/2")}
          </Typography>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Typography
            tag="h3"
            weight="bold"
            className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
          >
            {intl("privacy-policy/body/contact-us/social-media")}
          </Typography>

          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default Content;
