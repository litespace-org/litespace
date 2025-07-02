import FAQ from "@/components/FAQ/Content";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Tutors from "@/components/TutorsSection";
import CTA from "@/components/Common/CTA";

export default async function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <Tutors />
      <CTA />
      <FAQ home={true} />
    </main>
  );
}
