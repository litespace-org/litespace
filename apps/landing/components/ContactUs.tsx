import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import cn from "classnames";
import WhatsApp from "@litespace/assets/Whatsapp";
import Mail from "@litespace/assets/Mail";
import Telegram from "@litespace/assets/Telegram";
import PaperMessage1 from "@litespace/assets/PaperMessage1";
import PaperMessage2 from "@litespace/assets/PaperMessage2";
import ContactRequestForm from "@/components/ContactRequestForm";
import { Providers } from "@/app/providers";
import Link from "next/link";
import {
  LITESPACE_TUTORS_TELEGRAM,
  LITESPACE_WHATSAPP,
} from "@/constants/links";

const Contacts: React.FC<{ tutor?: boolean }> = ({ tutor }) => {
  const intl = useFormatMessage();
  return (
    <ul className="flex flex-col gap-4">
      <li>
        <Link
          className="flex flex-row items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 rounded-sm"
          href={LITESPACE_WHATSAPP}
          target="_blank"
        >
          <WhatsApp className="fill-white w-6 h-6" />
          <Typography tag="span" className="text-white text-body font-medium">
            {intl("contacts/phone")}
          </Typography>
        </Link>
      </li>
      <li className="flex flex-row items-center gap-4">
        <Mail className="fill-white w-6 h-6" />
        <Typography
          dir="ltr"
          tag="span"
          className="text-white text-body font-medium"
        >
          {intl("contacts/email")}
        </Typography>
      </li>
      {tutor ? (
        <li>
          <Link
            className="flex flex-row items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 rounded-sm"
            href={LITESPACE_TUTORS_TELEGRAM}
            target="_blank"
          >
            <Telegram className="fill-white w-6 h-6" />
            <Typography
              dir="ltr"
              tag="span"
              className="text-white text-body font-medium"
            >
              {intl("contacts/litespace-tutors-telegram")}
            </Typography>
          </Link>
        </li>
      ) : null}
    </ul>
  );
};

const ContactUs: React.FC<{ tutor?: boolean }> = ({ tutor }) => {
  const intl = useFormatMessage();
  return (
    <section className="flex flex-col items-center justify-center w-full h-auto bg-natural-50">
      <div
        className={cn(
          "flex flex-col justify-center items-center w-full lg:w-[943px] h-full gap-16 lg:gap-20",
          "py-14 sm:py-20 lg:py-40 px-4 sm:px-8 lg:px-auto"
        )}
      >
        <div className="hidden md:flex flex-col gap-4 text-center">
          <Typography tag="h1" className="text-natural-950 text-h4 font-bold">
            {intl.rich("contact-us/title", {
              highlight: (chunks) => (
                <Typography tag="span" className="text-brand-500">
                  {chunks}
                </Typography>
              ),
            })}
          </Typography>
          <Typography
            tag="p"
            className="text-natural-700 text-subtitle-2 font-semibold"
          >
            {intl("contact-us/description")}
          </Typography>
        </div>

        <div
          className={cn(
            "flex flex-col md:flex-row w-full rounded-2xl",
            "sm:p-6 gap-6 h-full bg-natural-50 sm:shadow-header"
          )}
        >
          <div className="flex flex-col w-full md:w-3/5 h-auto bg-brand-700 rounded-xl">
            <div className="flex flex-col p-6">
              <div className="mb-10">
                <Typography
                  tag="h2"
                  className="text-white mb-2 text-subtitle-1 font-bold"
                >
                  {intl("contact-us/card/title")}
                </Typography>

                <Typography
                  tag="p"
                  className="text-white text-body font-medium"
                >
                  {intl("contact-us/card/description")}
                </Typography>
              </div>

              <Contacts tutor={tutor} />
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
            <Providers>
              <ContactRequestForm />
            </Providers>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
