"use client";
import { PAGES, SOCIAL_MEDIA } from "@/constants/ui";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Image from "next/image";
import SocialMediaIcon from "@/components/Layout/SocialMedia";
import { FooterLink } from "@/components/Layout/FooterLink";

export default function Footer() {
  const intl = useFormatMessage();
  return (
    <footer className="py-6 px-4 md:p-8 lg:px-0 z-0 lg:py-[72px] overflow-hidden relative bg-brand-900 text-natural-50 flex items-center justify-center">
      <div className="flex flex-col lg:max-w-[1108px] justify-center gap-7">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] justify-between lg:flex gap-6 md:gap-8 lg:gap-[86px]">
          <div className="flex grow min-w-[292px] max-w-[475px] flex-col gap-2 lg:gap-4">
            <div className="flex gap-2 lg:gap-6 items-center">
              <Image
                src={"/logo.svg"}
                width={50}
                height={50}
                className="hidden lg:block"
                alt="LiteSpace"
              />
              <Image
                src={"/logo.svg"}
                width={40}
                height={40}
                className="lg:hidden"
                alt="LiteSpace"
              />
              <h4 className="text-natural-50 text-xl leading-[30px] lg:text-[32px] lg:leading-[48px] font-bold">
                LiteSpace
              </h4>
            </div>
            <p className="text-natural-50 font-medium leading-[18px] text-xs lg:text-sm lg:font-normal lg:leading-[21px]">
              {intl("landing.footer.description")}
            </p>
          </div>
          <div className="hidden lg:flex gap-[86px]">
            <div className="flex min-w-[179px] flex-col gap-4">
              <h4 className="font-semibold">
                {intl("landing.routes.main-pages")}
              </h4>
              <div className="flex flex-col gap-2">
                {PAGES.map((page) => (
                  <FooterLink
                    key={page.title}
                    {...page}
                    title={intl(page.title)}
                  />
                ))}
                <FooterLink
                  title={intl("landing.routes.terms-and-conditions")}
                  route={"/"}
                />
              </div>
            </div>
            <div className="flex min-w-[179px] flex-col gap-4">
              <h4 className="font-semibold text-base">
                {intl("landing.routes.important-routes")}
              </h4>
              <div className="flex flex-col gap-2">
                <FooterLink
                  title={intl("landing.routes.tutor-guide")}
                  route={"/"}
                />
                <FooterLink
                  title={intl("landing.routes.student-guide")}
                  route={"/"}
                />
                <FooterLink title={intl("landing.routes.faq")} route={"/"} />
                <FooterLink
                  title={intl("landing.routes.contact-us")}
                  route={"/"}
                />
              </div>
            </div>
          </div>
          <div className="flex min-w-[200px] flex-col gap-2 lg:gap-4">
            <h4 className="text-base font-semibold">
              {intl("landing.footer.follow-us.title")}
            </h4>
            <h5 className="text-natural-100 text-sm font-semibold leading-[21px]">
              {intl("landing.footer.follow-us.description")}
            </h5>
            <div className="grid grid-cols-[repeat(3,40px)] justify-start gap-4">
              {SOCIAL_MEDIA.map((item) => (
                <SocialMediaIcon key={item.src} {...item} />
              ))}
            </div>
          </div>
          <div className="flex lg:hidden gap-4">
            <div className="flex min-w-[156px] flex-col gap-4">
              <h4 className="font-semibold text-base">
                {intl("landing.routes.main-pages")}
              </h4>
              <div className="flex flex-col gap-2">
                {PAGES.map((page) => (
                  <FooterLink
                    key={page.title}
                    {...page}
                    title={intl(page.title)}
                  />
                ))}
                <FooterLink
                  title={intl("landing.routes.terms-and-conditions")}
                  route={"/"}
                />
              </div>
            </div>
            <div className="flex min-w-[156px] flex-col gap-4">
              <h4 className="font-semibold text-base">
                {intl("landing.routes.important-routes")}
              </h4>
              <div className="flex flex-col gap-2">
                <FooterLink
                  title={intl("landing.routes.tutor-guide")}
                  route={"/"}
                />
                <FooterLink
                  title={intl("landing.routes.student-guide")}
                  route={"/"}
                />
                <FooterLink title={intl("landing.routes.faq")} route={"/"} />
                <FooterLink
                  title={intl("landing.routes.contact-us")}
                  route={"/"}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-natural-100 border-t pt-2 lg:pt-[18px] text-end">
          <Typography element="caption" weight="semibold">
            LiteSpace Foundation © {new Date().getFullYear()}
          </Typography>
        </div>
      </div>
      <div className="bg-brand-600 blur-[200px] absolute w-[500px] h-[350px] rotate-[12.5deg] rounded-full overflow-hidden -top-3/4 -right-3/4 md:-top-3/4 md:-right-1/4 -z-10" />
      <div className="bg-brand-600 blur-[200px] absolute w-[400px] h-[300px] md:w-[500px] md:h-[350px] rotate-[12.5deg] rounded-full overflow-hidden top-1/4 md:bottom-3/4 -z-10 translate-x-1/3 md:translate-x-2/3" />
      <div className="bg-brand-600 blur-[200px] absolute w-[500px] h-[350px] rotate-[12.5deg] rounded-full overflow-hidden -bottom-full -z-10 md:-left-1/3" />
    </footer>
  );
}
