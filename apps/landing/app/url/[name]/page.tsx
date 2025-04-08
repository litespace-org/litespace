import { IShortUrl } from "@litespace/types";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: { name: IShortUrl.Id };
};

const urls: Record<IShortUrl.Id, string> = {
  [IShortUrl.Id.WhatsApp]: "https://wa.me/201503310108",
  [IShortUrl.Id.StudentsFacebook]: "https://www.facebook.com/litespace.eng",
  [IShortUrl.Id.StudentsYouTube]: "https://www.youtube.com/@litespace_eng",
  [IShortUrl.Id.StudentsInstagram]: "https://www.instagram.com/litespace_eng",
  [IShortUrl.Id.StudentsTikTok]: "https://www.tiktok.com/@litespace.eng",
  [IShortUrl.Id.StudentsX]: "https://x.com/litespace_eng",
};

export default async function Url({ params }: Props) {
  const url = urls[params.name];
  if (url) return redirect(url);
  return notFound();
}
