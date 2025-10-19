import React, { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { ILesson, IPlan, ITutor } from "@litespace/types";
import { formatMinutes, formatNumber, formatWeeks } from "@litespace/ui/utils";
import {
  PLAN_PERIOD_LITERAL_TO_WEEK_COUNT,
  calculateLessonPrice,
  price,
} from "@litespace/utils";
import { LocalId } from "@litespace/ui/locales";
import {
  calculateTotalPriceAfterDiscount,
  calculateTotalPriceBeforeDiscount,
} from "@litespace/utils/plan";
import { TxTypeData } from "@/components/Checkout/types";
import { AvatarV2 } from "@litespace/ui/Avatar";
import Star from "@litespace/assets/Star";
import Calendar from "@litespace/assets/Calendar";
import Clock from "@litespace/assets/Clock";
import dayjs from "@/lib/dayjs";
import { track } from "@/lib/analytics";
import { useFindTutorRatings } from "@litespace/headless/rating";

const PLAN_PERIOD_LITERAL_TO_MESSAGE_ID: Record<IPlan.PeriodLiteral, LocalId> =
  {
    month: "checkout.plan.period.month",
    quarter: "checkout.plan.period.quarter",
    year: "checkout.plan.period.year",
    "free-trial": "checkout.plan.period.free-trial",
  };

const TxTypeDetails: React.FC<{ txTypeData: TxTypeData }> = ({
  txTypeData,
}) => {
  if (txTypeData.type === "paid-lesson" && txTypeData.data.tutor)
    return (
      <Lesson
        tutor={txTypeData.data.tutor}
        start={txTypeData.data.start}
        duration={txTypeData.data.duration}
      />
    );

  if (txTypeData.type === "paid-plan" && txTypeData.data.plan)
    return <Plan plan={txTypeData.data.plan} period={txTypeData.data.period} />;
};

const Plan: React.FC<{
  plan: IPlan.Self;
  period: IPlan.PeriodLiteral;
}> = ({ plan, period }) => {
  const intl = useFormatMessage();

  return (
    <Card>
      <Typography
        tag="h1"
        className="text-body lg:text-subtitle-1 font-bold px-4 lg:px-6 mb-2 lg:mb-4"
      >
        {intl("checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-4 pb-4 md:pb-5 lg:pb-4 lg:px-6">
        <Typography
          tag="h2"
          className="text-caption lg:text-subtitle-2 font-bold lg:font-semibold"
        >
          {intl(PLAN_PERIOD_LITERAL_TO_MESSAGE_ID[period])}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-medium md:font-normal"
        >
          {intl("checkout.plan.houry-quota", {
            hours: formatMinutes(plan.weeklyMinutes),
            weeks: formatWeeks(PLAN_PERIOD_LITERAL_TO_WEEK_COUNT[period]),
          })}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 p-4 md:pb-5 lg:p-6 border-y border-natural-100">
        <div className="flex justify-between">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("checkout.plan.month-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("labels.currency.egp", {
              value: formatNumber(price.unscale(plan.baseMonthlyPrice)),
            })}
          </Typography>
        </div>
        <div className="flex justify-between">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("checkout.plan.total-price-before-discount")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("labels.currency.egp", {
              value: formatNumber(
                calculateTotalPriceBeforeDiscount(plan.baseMonthlyPrice, period)
              ),
            })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-4 lg:px-6 mt-4 lg:mt-6">
        <Typography
          tag="span"
          className="text-caption lg:text-body font-semibold md:font-bold"
        >
          {intl("checkout.plan.total-price-after-discount")}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-semibold md:font-bold"
        >
          {intl("labels.currency.egp", {
            value: formatNumber(calculateTotalPriceAfterDiscount(plan, period)),
          })}
        </Typography>
      </div>

      <Link
        onClick={() => {
          track("change_plan", "checkout");
          track("leave_checkout", "checkout", "user_clicked_change_plan");
        }}
        to={Web.Plans}
        className="px-4 lg:px-6 mt-6 lg:mt-8"
        tabIndex={-1}
      >
        <Button type="main" size="large" variant="secondary" className="w-full">
          <Typography
            tag="span"
            className="text text-caption md:text-body font-semibold md:font-medium"
          >
            {intl("checkout.plan.change-plan")}
          </Typography>
        </Button>
      </Link>
    </Card>
  );
};

const Lesson: React.FC<{
  tutor: ITutor.FindTutorInfoApiResponse;
  start: string;
  duration: ILesson.Duration;
}> = ({ tutor, start, duration }) => {
  const intl = useFormatMessage();
  return (
    <Card>
      <div className="flex flex-col">
        <Typography
          tag="h4"
          className="text-body lg:text-subtitle-1 font-bold text-natural-950 px-4 lg:px-6 mb-2 lg:mb-4"
        >
          {intl("checkout.lesson.details")}
        </Typography>
        <TutorDetails tutor={tutor} />
        <Divider />
        <LessonDetails start={start} duration={duration} />
        <Divider />
        <LessonPrice duration={duration} />
        <ChangeLessonTiming start={start} />
      </div>
    </Card>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col py-4 lg:py-6 rounded-2xl border border-natural-100">
      {children}
    </div>
  );
};

const TutorDetails: React.FC<{ tutor: ITutor.FindTutorInfoApiResponse }> = ({
  tutor,
}) => {
  const intl = useFormatMessage();

  const tutorRatings = useFindTutorRatings(tutor.id, {});
  const tutorRatingsCount = useMemo(
    () => tutorRatings.query.data?.list.length,
    [tutorRatings.query.data?.list.length]
  );

  return (
    <div className="px-4 lg:px-6 mb-[13px] lg:mb-4">
      <Typography
        tag="p"
        className="text-body lg:text-subtitle-2 font-semibold text-natural-950 mb-2 lg:mb-4"
      >
        {intl("checkout.lesson.your-tutor")}
      </Typography>

      <div className="flex flex-row gap-2">
        <div className="w-[66px] h-[66px] lg:w-[74px] lg:h-[74px] rounded-lg overflow-hidden">
          <AvatarV2 id={tutor.id} src={tutor.image} alt={tutor.name} />
        </div>
        <div>
          <Typography
            tag="p"
            className="text-caption md:text-subtitle-2 font-bold text-natural-950 mb-2 lg:mb-1"
          >
            {tutor.name}
          </Typography>
          <Typography
            tag="p"
            data-show={!!tutor.bio}
            className="text-extra-tiny lg:text-tiny text-natural-600 data-[show=false]:hidden line-clamp-1"
          >
            {tutor.bio}
          </Typography>

          <div className="flex flex-row gap-4 items-center justify-start mt-1">
            <Typography
              tag="span"
              data-show={!!tutor.lessonCount && !!tutor.studentCount}
              className="text-tiny text-natural-700 data-[show=false]:hidden"
            >
              {intl("checkout.lesson.n-lessons-with-n-students", {
                lessonCount: formatNumber(tutor.lessonCount),
                studentCount: formatNumber(tutor.studentCount),
              })}
            </Typography>
            <div
              data-show={!!tutor.avgRating}
              className="flex flex-row items-center justify-center gap-1 data-[show=false]:hidden"
            >
              <Star className="w-[18px] h-[18px] [&>*]:fill-warning-500" />
              <Typography tag="span" className="text-tiny text-natural-600">
                {formatNumber(tutor.avgRating, { maximumFractionDigits: 2 })}
                &nbsp;
                {tutorRatingsCount
                  ? intl("tutor.rate-count", {
                      value: formatNumber(tutorRatingsCount),
                    })
                  : null}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonDetails: React.FC<{
  start: string;
  duration: ILesson.Duration;
}> = ({ start, duration }) => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 lg:px-6 mt-4 mb-[10px] md:mb-4">
      <Typography
        tag="p"
        className="text-body lg:text-subtitle-2 font-semibold mb-2"
      >
        {intl("checkout.lesson.trial-lesson-time")}
      </Typography>
      <div className="flex flex-row gap-3 items-center justify-between">
        <div className="flex flex-row gap-1 lg:gap-2 items-center justify-center">
          <Calendar className="w-6 h-6 [&>*]:stroke-natural-700" />
          <Typography
            tag="span"
            className="text-caption font-semibold text-natural-700"
          >
            {dayjs(start).format("D MMMM YYYY")}
          </Typography>
        </div>
        <div className="flex flex-row gap-1 lg:gap-2 items-center justify-center">
          <Clock className="w-6 h-6 [&>*]:stroke-natural-700" />
          <Typography
            tag="span"
            className="text-caption font-semibold text-natural-700"
          >
            {dayjs(start).format("H:mm A")} (
            {intl("labels.n-minutes", { count: duration })})
          </Typography>
        </div>
      </div>
    </div>
  );
};

const LessonPrice: React.FC<{ duration: ILesson.Duration }> = ({
  duration,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 lg:px-6 mt-4 mb-4 lg:mb-6 flex flex-row items-center justify-between">
      <Typography
        tag="p"
        className="text-caption lg:text-body font-semibold lg:font-normal"
      >
        {intl("checkout.lesson.lesson-price")}
      </Typography>

      <Typography
        tag="p"
        className="text-caption lg:text-body font-semibold lg:font-normal"
      >
        {intl("labels.currency.egp", {
          value: formatNumber(price.unscale(calculateLessonPrice(duration))),
        })}
      </Typography>
    </div>
  );
};

const ChangeLessonTiming: React.FC<{ start: string }> = ({ start }) => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 lg:px-6">
      <Typography tag="p" className="text-extra-tiny text-natural-700 mb-2">
        {intl("checkout.lesson.change-lesson-time-note", {
          time: dayjs(start).format("hh:mm A"),
          date: dayjs(start).format("dddd D MMMM"),
        })}
      </Typography>
      <Button
        type="natural"
        size="large"
        variant="primary"
        className="w-full"
        onClick={() => alert("todo...")}
      >
        <Typography tag="span" className="text-body font-medium">
          {intl("checkout.lesson.change-lesson-time")}
        </Typography>
      </Button>
    </div>
  );
};

const Divider: React.FC = () => {
  return <div className="w-full border-b border-natural-100" />;
};

export default TxTypeDetails;
