import Features from "@/components/Features";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ/Content";

export default async function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <FAQ />
    </main>
  );
}
