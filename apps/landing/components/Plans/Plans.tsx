import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales/request";
import { Typography } from "@litespace/ui/Typography";
import Link from "next/link";
import cn from "classnames";
import CurvedDashedLine from "@litespace/assets/CurvedDashedLine";
import { Animate } from "@/components/Common/Animate";
import PlanCard from "@/components/Plans/PlanCard";
import data from "@/components/Plans/data.json";
import { ActiveLine } from "@/components/Plans/Line";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { IUser } from "@litespace/types";
import { CurvedLine } from "@/components/Plans/CurvedLine";
import AbstractLine from "@litespace/assets/AbstractLine";
import { PlansDataProps, Tab } from "@/types/plans";

const PLANS_TITLE_ID_MAP: { [key: number]: LocalId } = {
  1: "plans/titles/beginning",
  2: "plans/titles/advanced",
  3: "plans/titles/professional",
};

const PLANS_DESC_ID_MAP: { [key: number]: LocalId } = {
  1: "plans/descriptions/beginning",
  2: "plans/descriptions/advanced",
  3: "plans/descriptions/professional",
};

const { data: plansJson } = data as { data: PlansDataProps };

const Plans: React.FC<{ activeTab: Tab }> = ({ activeTab = "annual" }) => {
  const intl = useFormatMessage();

  const tabs: Array<{ value: Tab; label: LocalId }> = [
    {
      value: "monthly",
      label: "plans/labels/monthly",
    },
    {
      value: "quarter",
      label: "plans/labels/quarter",
    },
    {
      value: "half",
      label: "plans/labels/half",
    },
    {
      value: "annual",
      label: "plans/labels/annual",
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 justify-center items-center text-center mb-16">
        <Typography
          tag="h3"
          className="text-natural-950 text-subtitle-1 md:text-h4 max-w-[328px] md:max-w-max font-bold"
        >
          {intl.rich("plans/message/title", {
            plans: (chunks) => (
              <span className="text-brand-500 relative">
                {chunks}
                <AbstractLine className="absolute md:hidden top-1 -left-3" />
              </span>
            ),
          })}
        </Typography>
        <Typography
          tag="p"
          className="text-natural-700 max-w-[328px] md:max-w-[808px] sm:max-w-4xl inline text-body md:text-subtitle-2 font-regular lg:font-semibold"
        >
          {intl("plans/message/description")}
        </Typography>
      </div>
      <div className="flex items-center gap-[51px] lg:gap-16 justify-center">
        {tabs.map((tab, idx) => (
          <div key={idx} className="relative py-2">
            {tab.value === "half" ? (
              <>
                <Typography
                  tag="span"
                  className="absolute -top-[50px] md:-top-[57px] -right-[130px] md:-right-[115px] text-brand-600 bg-natural-50 rounded-[30px] shadow-plan-tooltip p-2 text-tiny font-regular"
                >
                  {intl("plans/installments/three-month")}
                </Typography>
                <div className="absolute -top-10 md:-top-[50px] right-1 w-7 md:w-[35px] h-[15px] origin-bottom-left translate-x-2 md:rotate-0">
                  <CurvedDashedLine />
                </div>
              </>
            ) : null}
            {tab.value === "annual" ? (
              <>
                <Typography
                  tag="span"
                  className="absolute min-w-[106px] -bottom-[50px] md:-bottom-[20px] left-9 md:-left-[145px] text-brand-600 bg-natural-50 rounded-[30px] shadow-plan-tooltip p-2 text-tiny font-regular"
                >
                  {intl("plans/installments/six-month")}
                </Typography>
                <CurvedLine />
              </>
            ) : null}
            <Link scroll={false} href={`?tab=${tab.value}`}>
              <Typography
                tag="p"
                className={cn(
                  "text-caption md:text-body font-semibold",
                  activeTab === tab.value
                    ? "text-brand-700"
                    : "text-natural-500"
                )}
              >
                {intl(tab.label)}
              </Typography>
            </Link>
            {activeTab === tab.value ? <ActiveLine /> : null}
          </div>
        ))}
      </div>
      <div>
        <Animate key={activeTab} tab={activeTab}>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center md:gap-6 mt-[124px]">
            {plansJson[activeTab].map((plan, idx) => (
              <div
                key={plan.id}
                className={cn(
                  "max-w-[328px] lg:max-w-[368px] mx-auto",
                  { "mb-4 lg:mb-0": idx !== 1 },
                  {
                    "mb-12 lg:-mt-10 md:col-span-2 lg:col-span-1 md:order-last lg:order-2":
                      idx === 1,
                  },
                  { "md:order-2 lg:order-3": idx === 2 }
                )}
              >
                <PlanCard
                  title={intl(PLANS_TITLE_ID_MAP[plan.id])}
                  description={intl(PLANS_DESC_ID_MAP[plan.id], {
                    value: plan.weeklyMinutes,
                  })}
                  weeklyMinutes={plan.weeklyMinutes}
                  price={plan.price}
                  label={plan.label}
                  primary={plan.primary}
                  href={router.web({
                    route: Web.Register,
                    role: IUser.Role.Student,
                    full: true,
                  })}
                />
              </div>
            ))}
          </div>
        </Animate>
      </div>
    </section>
  );
};

export default Plans;
