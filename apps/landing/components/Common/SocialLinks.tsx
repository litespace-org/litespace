import React from "react";
import Link from "next/link";
import Facebook from "@litespace/assets/Facebook";
import Insta from "@litespace/assets/Instagram";
import Linkedin from "@litespace/assets/Linkedin";
import WhatsApp from "@litespace/assets/WhatsApp";

const socials = [
  {
    href: "https://www.instagram.com/litespace_eng",
    icon: <Insta className="w-8 h-8" />,
  },
  {
    href: "https://www.facebook.com/litespace.eng",
    icon: <Facebook className="w-8 h-8" />,
  },
  {
    href: "https://www.linkedin.com/company/litespace-eng",
    icon: <Linkedin className="w-8 h-8" />,
  },
  {
    href: "https://wa.me/201503310108",
    icon: <WhatsApp className="w-8 h-8" />,
  },
];

export const SocialLinks: React.FC = () => (
  <div className="flex gap-6">
    {socials.map(({ href, icon }, i) => (
      <Link
        key={i}
        href={href}
        className="flex items-center justify-center"
        target="_blank"
      >
        {icon}
      </Link>
    ))}
  </div>
);
