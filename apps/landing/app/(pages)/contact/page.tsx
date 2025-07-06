import Hero from "@/components/Common/Hero";
import ContactUs from "@/components/ContactUs";

type Props = {
  searchParams: { role: "student" | "tutor" };
};

export default async function Contact(props: Props) {
  return (
    <main>
      <Hero title="contact-us/page/title" description="contact-us/page/desc" />
      <ContactUs tutor={props.searchParams.role === "tutor"} />
    </main>
  );
}
