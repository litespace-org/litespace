import Features from "@/components/Features";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ/Content";
import Plans from "@/components/Plans/Plans";
import { Tab } from "@/types/plans";
import Tutors from "@/components/Tutors";

type Props = {
  searchParams: {
    tab?: Tab;
  };
};

export default async function Home({ searchParams }: Props) {
  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <Tutors />
      <Plans activeTab={searchParams.tab || "annual"} />
      <FAQ />
    </main>
  );
}
