import Hero from "@/components/Common/Hero";
import Plans from "@/components/Plans/Plans";
import { Tab } from "@/types/plans";

export default function Page({
  searchParams,
}: {
  searchParams: {
    tab: Tab;
  };
}) {
  const { tab } = searchParams;

  return (
    <main>
      <Hero title="pricing/title" description="pricing/description" />
      <Plans activeTab={tab || "annual"} />
    </main>
  );
}
