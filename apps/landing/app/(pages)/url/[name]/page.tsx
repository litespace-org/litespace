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
  [IShortUrl.Id.ManagePlansVideo]:
    "https://drive.google.com/file/d/1SaLpO5IwrGGuACAZH1RbtNuoPCJ53uu1/view?usp=drive_link",
  [IShortUrl.Id.ManageTutorsDoc]:
    "https://docs.google.com/document/d/1cmKGhpokGd8UrP9DTPaV6brIILY5qf_xGI7jVb6eNVc/edit?usp=drive_link",
};

export default async function Url({ params }: Props) {
  const url = urls[params.name];
  if (url) return redirect(url);
  return notFound();
}
