import Hero from "@/components/Common/Hero";
import ContactUs from "@/components/ContactUs";
import { IUser } from "@litespace/types";

type Props = {
  searchParams: { role: IUser.Role.Student | IUser.Role.Tutor };
};

export default async function Contact(props: Props) {
  return (
    <main>
      <Hero title="contact-us/page/title" description="contact-us/page/desc" />
      <ContactUs tutor={props.searchParams.role === IUser.Role.Tutor} />
    </main>
  );
}
