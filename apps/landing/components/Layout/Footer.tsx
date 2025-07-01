import { FooterLink } from "@/components/Common/FooterLink";
import Link from "@/components/Common/Link";
import {
  LITESPACE_EMAIL_LINK,
  LITESPACE_FACEBOOK,
  LITESPACE_INSTAGRAM,
  LITESPACE_LINKEDIN,
  LITESPACE_TIKTOK,
  LITESPACE_WHATSAPP,
} from "@/constants/links";
import { PAGES } from "@/constants/ui";
import { useFormatMessage } from "@/hooks/intl";
import Facebook from "@litespace/assets/Facebook";
import Instagram from "@litespace/assets/Instagram";
import Tiktok from "@litespace/assets/Tiktok";
import Linkedin from "@litespace/assets/Linkedin";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { Landing } from "@litespace/utils/routes";
import React, { ElementType } from "react";
import GoUpButton from "@/components/Layout/GoUpButton";
import cn from "classnames";
import { router } from "@/lib/routes";
import WhatsApp from "@litespace/assets/WhatsApp";
import Mail from "@litespace/assets/Mail";

function SocialMediaIcon({
  icon: Icon,
  href,
}: {
  icon: ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-center justify-center p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-lg"
      track={{
        event: "view_social_media",
        params: {
          src: "footer",
          action: "link",
          url: href,
        },
      }}
    >
      <Icon className="[&>*]:fill-natural-600 w-6 h-6" />
    </Link>
  );
}

const SOCIAL_MEDIA: Array<{ href: string; icon: ElementType }> = [
  {
    href: LITESPACE_INSTAGRAM,
    icon: Instagram,
  },
  {
    href: LITESPACE_FACEBOOK,
    icon: Facebook,
  },
  {
    href: LITESPACE_LINKEDIN,
    icon: Linkedin,
  },
  {
    href: LITESPACE_WHATSAPP,
    icon: WhatsApp,
  },
  {
    href: LITESPACE_TIKTOK,
    icon: Tiktok,
  },
  {
    href: LITESPACE_EMAIL_LINK,
    icon: () => <Mail className="[&>*]:stroke-natural-600 stroke-[1.5px]" />,
  },
];

const Links: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex col-span-1 lg:col-span-4">
      <div className="flex flex-1 min-w-fit flex-col gap-4">
        <Typography
          tag="h4"
          className="font-semibold text-body text-natural-800"
        >
          {intl("footer/links/main-pages")}
        </Typography>
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-[18px]">
          {PAGES.map((page) => (
            <FooterLink key={page.title} {...page} text={intl(page.title)} />
          ))}
          <FooterLink text={intl("footer/links/terms")} route={Landing.Terms} />
          <FooterLink
            text={intl("footer/links/privacy")}
            route={Landing.Privacy}
          />
        </div>
      </div>
      <div className="flex flex-1 min-w-fit flex-col gap-4">
        <Typography
          tag="h4"
          className="font-semibold text-base text-natural-800"
        >
          {intl("footer/links/important-routes")}
        </Typography>
        <div className="flex flex-col gap-2">
          <FooterLink
            text={intl("footer/links/tutor-guide")}
            route={router.landing({
              route: Landing.FaqRole,
              role: "tutor",
            })}
          />
          <FooterLink
            text={intl("footer/links/student-guide")}
            route={router.landing({
              route: Landing.FaqRole,
              role: "student",
            })}
          />
          <FooterLink text={intl("footer/links/faq")} route={Landing.Faq} />
          <FooterLink
            text={intl("footer/links/contact-us")}
            route={Landing.Contact}
          />
          <FooterLink text={intl("footer/links/about")} route={Landing.About} />
        </div>
      </div>
    </div>
  );
};

const SocialLinks = ({ className }: { className?: string }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn("flex min-w-[200px] flex-col gap-2 lg:gap-4", className)}
    >
      <Typography
        tag="h5"
        className="text-natural-800 text-body font-semibold leading-[21px]"
      >
        {intl("footer/follow-us/description")}
      </Typography>
      <div className="grid grid-cols-[repeat(3,40px)] justify-start gap-4">
        {SOCIAL_MEDIA.map((item) => (
          <SocialMediaIcon key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
};

const Introduction = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex grow min-w-[292px] max-w-[475px] flex-col gap-2 lg:gap-4 col-span-1 md:col-span-2 lg:col-span-6">
      <div className="flex gap-2 items-center">
        <Logo className="w-8 h-8" />
        <Typography
          tag="h4"
          className="text-brand-500 text-subtitle-2 font-bold"
        >
          {intl("labels/litespace")}
        </Typography>
      </div>
      <Typography
        tag="p"
        className="text-natural-600 font-medium text-tiny lg:mb-8"
      >
        {intl("footer/description")}
      </Typography>
      <GoUpButton />
    </div>
  );
};

export const Footer: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <footer className="overflow-hidden relative text-natural-50 flex items-center justify-center p-4 md:p-8 lg:px-0 lg:pt-[72px] lg:pb-[42px] bg-natural-0">
      <div className="w-full flex flex-col lg:max-w-screen-xl gap-4 z-10 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-6 md:gap-y-10">
          <Introduction />
          <SocialLinks className="flex md:hidden col-span-1" />
          <Links />
          <SocialLinks className="hidden md:flex lg:col-span-2" />
        </div>
        <div className="border-natural-100 border-t pt-4 md:pt-[25px]">
          <Typography
            tag="p"
            className="text-natural-800 text-caption font-normal text-center md:text-start"
          >
            {intl("footer/copyrights", { year: new Date().getFullYear() })}
          </Typography>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
