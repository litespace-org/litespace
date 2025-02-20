import React from "react";
import Link from "next/link";

import Facebook from "@litespace/assets/Facebook";
import Youtube from "@litespace/assets/Youtube";
import Insta from "@litespace/assets/Instagram";
import Linkedin from "@litespace/assets/Linkedin";
import Whatsapp from "@litespace/assets/Whatsapp";

const socials = [
  {
    href: "https://www.instagram.com/litespace_eng",
    icon: <Insta className="w-8 h-8 fill-brand-500" />,
  },
  {
    href: "https://www.facebook.com/litespace.eng",
    icon: <Facebook className="w-8 h-8 fill-brand-500" />,
  },
  {
    href: "https://www.linkedin.com/company/litespace-eng",
    icon: <Linkedin className="w-8 h-8 fill-brand-500" />,
  },
  {
    href: "https://wa.me/201503310108",
    icon: <Whatsapp className="w-8 h-8 fill-brand-500" />,
  },
  {
    href: "https://www.youtube.com/@litespace_eng",
    icon: <Youtube className="w-8 h-8 fill-brand-500" />,
  },
];

export const SocialLinks: React.FC = () => (
  <div className="flex gap-2">
    {socials.map(({ href, icon }, i) => (
      <Link
        key={i}
        href={href}
        className="flex items-center justify-center bg-natural-50 h-10 w-10 rounded-full"
      >
        {icon}
      </Link>
    ))}
  </div>
);
