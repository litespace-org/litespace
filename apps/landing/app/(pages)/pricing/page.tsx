import Hero from "@/components/Common/Hero";
import { Selector } from "@/components/Plans";
import { api } from "@/lib/api";

export default async function Page() {
  const plans = await api.plan
    .find({
      active: true,
      forInvitesOnly: false,
      full: true,
    })
    .catch(() => {
      return { list: [], total: 0 };
    });

  return (
    <main className="bg-natural-0">
      <Hero title="pricing/title" description="pricing/description" />
      <Selector plans={plans.list} />
    </main>
  );
}
