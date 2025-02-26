import Ellipse from "@/components/Ellipse";
import Plans from "@/components/Plans/Plans";
import { useFormatMessage } from "@/hooks/intl";
import { Tab } from "@/types/plans";
import { Typography } from "@litespace/ui/Typography";

export default function Page({
  searchParams,
}: {
  searchParams: {
    tab: Tab;
  };
}) {
  const { tab } = searchParams;
  const intl = useFormatMessage();

  return (
    <main className="overflow-x-hidden">
      <div className="h-[308px] md:h-[max(50vh,512px)] pt-[72px] bg-brand-900 text-natural-50 mb-[56px] md:mb-20 text-center">
        <Ellipse className="flex flex-col gap-4 md:gap-10 items-center justify-center h-full">
          <Typography tag="h2" className="text-subtitle-1 md:text-h2 font-bold">
            {intl("subscription/title")}
          </Typography>
          <Typography
            tag="p"
            className="text-body md:text-subtitle-1 font-medium max-w-[328px] md:max-w-[808px]"
          >
            {intl("subscription/description")}
          </Typography>
        </Ellipse>
      </div>
      <Plans activeTab={tab || "annual"} />
    </main>
  );
}
