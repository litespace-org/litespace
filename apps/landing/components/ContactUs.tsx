// TODO: convert this component to server side once Typography task is done
"use client";

import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import cn from "classnames";
import WhatsApp from "@litespace/assets/Whatsapp2";
import Mail from "@litespace/assets/Mail";
import PaperMessage1 from "@litespace/assets/PaperMessage1";
import PaperMessage2 from "@litespace/assets/PaperMessage2";
import ContactRequestForm from "@/components/ContactRequestForm";

const ContactUs: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <section className="flex flex-col items-center justify-center w-full h-screen bg-natural-50">
      <div
        className={cn(
          "flex flex-col justify-center items-center w-full lg:w-[943px] h-full gap-16 lg:gap-20",
          "py-14 sm:py-20 lg:py-30 px-4 sm:px-8 lg:px-auto"
        )}
      >
        <div className="hidden md:flex flex-col gap-4 text-center">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="text-brand-500"
          >
            {intl("section/contact-us/title/1")}{" "}
            <span className="text-natural-950">
              {intl("section/contact-us/title/2")}
            </span>
          </Typography>
          <Typography
            element="subtitle-2"
            weight="semibold"
            className="text-natural-700"
          >
            {intl("section/contact-us/description")}
          </Typography>
        </div>

        <div
          className={cn(
            "flex flex-col md:flex-row w-full items-center justify-center rounded-2xl",
            "sm:p-6 gap-6 h-auto md:h-[454px] lg:h-[518px] bg-natural-50 sm:drop-shadow-xl"
          )}
        >
          <div className="flex flex-col w-full md:w-3/5 h-full bg-brand-700 rounded-xl">
            <div className="flex flex-col p-6">
              <Typography
                element="subtitle-1"
                weight="bold"
                className="text-white mb-2"
              >
                {intl("section/contact-us/card/title")}
              </Typography>

              <Typography
                element="body"
                weight="medium"
                className="text-white mb-10"
              >
                {intl("section/contact-us/card/description")}
              </Typography>

              <div className="flex items-center gap-4 mb-4">
                <WhatsApp className="w-6 h-6" />
                <Typography
                  element="body"
                  weight="medium"
                  className="text-white"
                  dir="ltr"
                >
                  {intl("section/contact-us/phone")}
                </Typography>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6" />
                <Typography
                  element="body"
                  weight="medium"
                  className="text-white"
                >
                  {intl("section/contact-us/gmail")}
                </Typography>
              </div>
            </div>

            <div className="flex justify-between gap-1.5 mt-auto mb-6">
              <div className="flex justify-start w-auto">
                <PaperMessage2 />
              </div>
              <div className="w-auto">
                <PaperMessage1 />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full h-full">
            <ContactRequestForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
