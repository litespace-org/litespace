import Hero from "@/components/Hero";
import Plans from "@/components/Plans/Plans";
import { Tab } from "@/types/plans";

export default async function Home({
  searchParams,
}: {
  searchParams: {
    tab: Tab;
  };
}) {
  const { tab } = searchParams;

  return (
    <main className="flex flex-col gap-[120px]">
      <Hero />
      <Plans activeTab={tab || "annual"} />
    </main>
  );
}
