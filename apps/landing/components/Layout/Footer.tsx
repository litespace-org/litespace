import { PAGES } from "@/constants/ui";
import { Typography } from "@litespace/ui/Typography";
import { FooterLink } from "@/components/Common/FooterLink";
import Ellipse from "@/components/Ellipse";
import Logo from "@litespace/assets/Logo";
import React, { ElementType } from "react";
import Instagram from "@litespace/assets/Instagram";
import Facebook from "@litespace/assets/Facebook";
import Linkedin from "@litespace/assets/Linkedin";
import { Landing } from "@litespace/utils/routes";
import Link from "@/components/Common/Link";
import { useFormatMessage } from "@/hooks/intl";
import {
  LITESPACE_FACEBOOK,
  LITESPACE_INSTAGRAM,
  LITESPACE_LINKEDIN,
} from "@/constants/links";

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
      className="flex items-center justify-center p-2"
      track={{
        event: "view_social_media",
        params: {
          src: "footer",
          action: "link",
          url: href,
        },
      }}
    >
      <Icon className="fill-neutral-50 w-6 h-6" />
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
];

const DesktopLinks: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="hidden lg:flex gap-[86px]">
      <div className="flex min-w-[179px] flex-col gap-4">
        <Typography tag="h4" className="font-semibold text-body">
          {intl("footer/links/main-pages")}
        </Typography>
        <div className="flex flex-col gap-2">
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
      <div className="flex min-w-[179px] flex-col gap-4">
        <Typography tag="h4" className="font-semibold text-base">
          {intl("footer/links/important-routes")}
        </Typography>
        <div className="flex flex-col gap-2">
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

const MobileLinks: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex lg:hidden gap-4">
      <div className="flex min-w-[156px] flex-col gap-4">
        <Typography tag="h4" className="font-semibold text-base">
          {intl("footer/links/main-pages")}
        </Typography>
        <div className="flex flex-col gap-2">
          {PAGES.map((page) => (
            <FooterLink key={page.title} {...page} text={intl(page.title)} />
          ))}
          <FooterLink text={intl("footer/links/terms")} route={Landing.Terms} />
        </div>
      </div>
      <div className="flex min-w-[156px] flex-col gap-4">
        <Typography tag="h4" className="font-semibold text-base">
          {intl("footer/links/important-routes")}
        </Typography>
        <div className="flex flex-col gap-2">
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

export default function Footer() {
  const intl = useFormatMessage();

  return (
    <footer className="overflow-hidden relative text-natural-50">
      <Ellipse className="flex items-center justify-center py-6 px-4 md:p-8 lg:px-0 lg:py-[72px] bg-brand-900">
        <div className="flex flex-col lg:max-w-[1108px] justify-center gap-7 z-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] justify-between lg:flex gap-6 md:gap-8 lg:gap-[86px]">
            <div className="flex grow min-w-[292px] max-w-[475px] flex-col gap-2 lg:gap-4">
              <div className="flex gap-2 lg:gap-6 items-center">
                <Logo className="w-10 h-10 lg:w-[50px] lg:h-[50px]" />
                <Typography
                  tag="h4"
                  className="text-natural-50 text-xl leading-[30px] lg:text-[32px] lg:leading-[48px] font-bold"
                >
                  {intl("labels/litespace")}
                </Typography>
              </div>
              <Typography
                tag="p"
                className="text-natural-50 font-medium leading-[18px] text-xs lg:text-sm lg:font-normal lg:leading-[21px]"
              >
                {intl("footer/description")}
              </Typography>
            </div>

            <DesktopLinks />

            <div className="flex min-w-[200px] flex-col gap-2 lg:gap-4">
              <Typography tag="h4" className="text-base font-semibold">
                {intl("footer/follow-us/title")}
              </Typography>
              <Typography
                tag="h5"
                className="text-natural-100 text-sm font-semibold leading-[21px]"
              >
                {intl("footer/follow-us/description")}
              </Typography>
              <div className="grid grid-cols-[repeat(3,40px)] justify-start gap-4">
                {SOCIAL_MEDIA.map((item) => (
                  <SocialMediaIcon key={item.href} {...item} />
                ))}
              </div>
            </div>

            <MobileLinks />
          </div>

          <div className="border-natural-100 border-t pt-2 lg:pt-[18px] text-end">
            <Typography tag="p" className="text-caption font-semibold">
              {intl("footer/copyrights", { year: new Date().getFullYear() })}
            </Typography>
          </div>
        </div>
      </Ellipse>
    </footer>
  );
}
