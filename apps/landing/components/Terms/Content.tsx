// TODO: convert this component to server component once the Typography task is done
"use client";

import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

import Facebook from "@litespace/assets/Facebook";
import Youtube from "@litespace/assets/Youtube";
import Insta from "@litespace/assets/Instagram";
import Linkedin from "@litespace/assets/Linkedin";
import Whatsapp from "@litespace/assets/Whatsapp";

const Terms: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col py-14 px-4 sm:py-20 sm:px-8 md:py-20 md:px-[108px] gap-14 sm:gap-20">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/policies-updates-title")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/policies-updates-content/1")}
        </Typography>

        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/policies-updates-content/2")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/account-register-title")}
        </Typography>

        <div className="flex flex-col gap-2">
          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/account-register-content/1")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/account-register-content/2")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/account-register-content/3")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/account-register-content/4")}
            </Typography>
          </li>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/privacy-and-protection-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/privacy-and-protection-content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/payment-and-subscription-title")}
        </Typography>

        <div className="flex flex-col gap-2">
          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/payment-and-subscription-content/1")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/payment-and-subscription-content/2")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/payment-and-subscription-content/3")}
            </Typography>
          </li>

          <li className="mr-6 text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              {intl("terms/body/payment-and-subscription-content/4")}
            </Typography>
          </li>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/refund-policy-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/refund-policy-content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/booking-steps-title")}
        </Typography>

        <ol className="flex flex-col gap-2 text-brand-500">
          <li className="text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              1. {intl("terms/body/booking-steps-content/1")}
            </Typography>
          </li>

          <li className="text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              2. {intl("terms/body/booking-steps-content/2")}
            </Typography>
          </li>

          <li className="text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              3. {intl("terms/body/booking-steps-content/3")}
            </Typography>
          </li>

          <li className="text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              4. {intl("terms/body/booking-steps-content/4")}
            </Typography>
          </li>

          <li className="text-brand-500 text-[1.5rem]">
            <Typography
              tag="p"
              weight="medium"
              className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
            >
              5. {intl("terms/body/booking-steps-content/5")}
            </Typography>
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/required-permissions-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/required-permissions-content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/conversations-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/conversations-content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/rating-tutors-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/rating-tutors-content")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Typography
          tag="h2"
          weight="bold"
          className="text-natural-950 text-[1.5rem] sm:text-[2rem]"
        >
          {intl("terms/body/contact-us-title")}
        </Typography>
        <Typography
          tag="p"
          weight="medium"
          className="text-natural-950 text-[1rem] sm:text-[1.5rem]"
        >
          {intl("terms/body/contact-us-content")}
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

          <div className="flex gap-2">
            <a
              href="/instagram"
              className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
            >
              <Insta className="h-8 w-8" />
            </a>
            <a
              href="/facebook"
              className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
            >
              <Facebook className="h-8 w-8" />
            </a>
            <a
              href="/linkedin"
              className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
            >
              <Linkedin className="h-8 w-8" />
            </a>
            <a
              href="/whatsapp"
              className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
            >
              <Whatsapp className="h-8 w-8" />
            </a>
            <a
              href="/youtube"
              className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
            >
              <Youtube className="h-8 w-8" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
