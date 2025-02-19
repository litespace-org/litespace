import Image from "next/image";
import Link from "next/link";

export default function SocialMediaIcon({
  src,
  name,
  href,
}: {
  src: string;
  name: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="w-10 h-10 flex items-center rounded-full justify-center bg-natural-50"
    >
      <Image src={src} alt={name} width={32} height={32} />
    </Link>
  );
}
