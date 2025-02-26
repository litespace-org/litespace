import Features from "@/components/Features";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ/Content";
import Plans from "@/components/Plans/Plans";
import { Tab } from "@/types/plans";

type Props = {
  searchParams: {
    tab?: Tab;
  };
};

export default async function Home({ searchParams }: Props) {
  return (
    <main className="flex flex-col gap-[120px]">
      <Hero />
      <Features />
      <Plans activeTab={searchParams.tab || "annual"} />
      <FAQ />
    </main>
  );
}
