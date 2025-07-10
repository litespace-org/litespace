import Hero from "@/components/Common/Hero";
import Content from "@/components/Terms/Content";

export default async function Home() {
  return (
    <main>
      <Hero title="terms/hero/title" description="terms/hero/description" />
      <Content />
    </main>
  );
}
