import * as Tabs from "@radix-ui/react-tabs";
import React, { useCallback, useMemo, useState } from "react";
import { Typography } from "@litespace/ui/Typography";
import { PlanCard } from "@litespace/ui/PlanCard";
import { AnimatePresence, motion } from "framer-motion";
import CurvedDashedLine from "@litespace/assets/CurvedDashedLine";
import cn from "classnames";
import { useToast } from "@litespace/ui/Toast";
import { LocalId } from "@litespace/ui/locales";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { PlansDataProps, Tab } from "@/components/Plans/types";

const PLANS_TITLE_ID_MAP: { [key: number]: LocalId } = {
  1: "plans.titles.beginning",
  2: "plans.titles.advanced",
  3: "plans.titles.professional",
};

const PLANS_DESC_ID_MAP: { [key: number]: LocalId } = {
  1: "plans.descriptions.beginning",
  2: "plans.descriptions.advanced",
  3: "plans.descriptions.professional",
};

const Content: React.FC<{
  plans: PlansDataProps;
}> = ({ plans }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("monthly");
  const tabs = useMemo((): Array<{ value: Tab; label: LocalId }> => {
    return [
      {
        value: "monthly",
        label: "plans.labels.monthly",
      },
      {
        value: "quarter",
        label: "plans.labels.quarter",
      },
      {
        value: "half",
        label: "plans.labels.half",
      },
      {
        value: "annual",
        label: "plans.labels.annual",
      },
    ];
  }, []);

  const notifyComingSoon = useCallback(() => {
    toast.success({
      title: intl("plans.subscribe.soon.title"),
      description: intl("plans.subscribe.soon.description"),
    });
  }, [intl, toast]);

  const makeTabPlans = useMemo(
    () => (tab: Tab) => (
      <Animate key={tab} tab={tab}>
        <div className="flex gap-6 mt-[124px]">
          {plans?.[tab].map((plan, idx) => (
            <div
              key={plan.id}
              className={cn("max-w-[368px]", { "-mt-10": idx === 1 })}
            >
              <PlanCard
                title={intl(PLANS_TITLE_ID_MAP[plan.id])}
                description={intl(PLANS_DESC_ID_MAP[plan.id], {
                  value: plan.weeklyMinutes,
                })}
                weeklyMinutes={plan.weeklyMinutes}
                price={plan.price}
                discount={plan.discount}
                label={plan.label}
                primary={plan.primary}
                onBuy={notifyComingSoon}
              />
            </div>
          ))}
        </div>
      </Animate>
    ),
    [intl, notifyComingSoon, plans]
  );

  if (!plans) return null;

  return (
    <div>
      <div className="flex flex-col gap-4 justify-center items-center text-center mb-16">
        <Typography element="h3" weight="semibold" className="text-natural-950">
          {intl("plans.message.title")}
        </Typography>
        <Typography
          element="subtitle-1"
          weight="semibold"
          className="text-natural-600 max-w-4xl"
        >
          {intl("plans.message.description")}
        </Typography>
      </div>

      <div className="w-full flex justify-center">
        <Tabs.Root
          value={tab}
          onValueChange={(value: string) => setTab(value as Tab)}
        >
          <Tabs.List className="flex justify-center gap-16">
            {tabs.map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className={cn("py-2 relative")}
              >
                {/* these are quotes of installments above half and annual plans */}
                {value === "half" ? (
                  <>
                    <Typography
                      element="tiny-text"
                      weight="regular"
                      className="absolute -top-[57px] -right-[105px] text-brand-600 bg-natural-50 rounded-[30px] shadow-plan-tooltip p-2"
                    >
                      {intl("plans.installments.three-month")}
                    </Typography>
                    <div className="absolute -top-[50px] right-1 w-[35px] h-[15px]">
                      <CurvedDashedLine />
                    </div>
                  </>
                ) : null}
                {value === "annual" ? (
                  <>
                    <Typography
                      element="tiny-text"
                      weight="regular"
                      className="absolute -bottom-[20px] -left-[355%] text-brand-600 bg-natural-50 rounded-[30px] shadow-plan-tooltip p-2"
                    >
                      {intl("plans.installments.six-month")}
                    </Typography>
                    <div className="absolute -bottom-[35px] -left-[115%] w-[35px] h-[15px] -rotate-[140deg]">
                      <CurvedDashedLine />
                    </div>
                  </>
                ) : null}

                <Typography
                  element="body"
                  weight="semibold"
                  className={cn(
                    "transition-colors duration-300",
                    value === tab ? "text-brand-700" : "text-natural-500"
                  )}
                >
                  {intl(label)}
                </Typography>

                <AnimatePresence>
                  {tab === value ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: {
                          duration: 0.3,
                        },
                      }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-brand-700 rounded-t-[10px]"
                    />
                  ) : null}
                </AnimatePresence>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="mt-8">
            <AnimatePresence initial={false} mode="wait">
              {tab === "monthly" ? makeTabPlans("monthly") : null}
              {tab === "quarter" ? makeTabPlans("quarter") : null}
              {tab === "half" ? makeTabPlans("half") : null}
              {tab === "annual" ? makeTabPlans("annual") : null}
            </AnimatePresence>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
};

const Animate: React.FC<{ children: React.ReactNode; tab: Tab }> = ({
  children,
  tab,
}) => {
  return (
    <motion.div
      key={tab}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.1,
          ease: "linear",
        },
      }}
      exit={{
        opacity: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Content;
