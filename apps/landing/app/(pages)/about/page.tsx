import Hero from "@/components/Common/Hero";
import Content from "@/components/About/Content";
import ContactUs from "@/components/ContactUs";

export default async function About() {
  return (
    <main>
      <Hero title="about/hero/title" description="about/hero/description" />
      <Content />
      <ContactUs />
    </main>
  );
}
