import FAQ from "@/components/FAQ/Content";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Tutors from "@/components/TutorsSection";
import CTA from "@/components/CTA";

export default async function Home() {
  return (
    <main className="flex flex-col w-screen overflow-x-hidden">
      <Hero />
      <Features />
      <CTA />
      <Tutors />
      <FAQ home={true} />
    </main>
  );
}
