import Hero from "@/components/Common/Hero";
import Content from "@/components/FAQ/Content";

export default async function Home() {
  return (
    <main>
      <Hero
        title="faq/hero/title"
        description="faq/hero/description"
        descClassName="lg:px-32 xl:px-56"
      />
      <Content role="tutor" />
    </main>
  );
}
