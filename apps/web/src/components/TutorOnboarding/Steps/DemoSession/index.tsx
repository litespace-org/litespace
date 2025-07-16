import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import Logo from "@litespace/assets/Logo";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { Void } from "@litespace/types";
import { FindAvailabilitySlotsApiResponse } from "@litespace/types/dist/esm/availabilitySlot";
import { Avatar } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { MonthlyCalendar } from "@litespace/ui/MonthlyCalendar";
import { Optional } from "@litespace/ui/Optional";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import dayjs, { Dayjs } from "dayjs";
import { isEmpty } from "lodash";
import React, { useCallback, useState } from "react";
import { useCreateDemoSession } from "@litespace/headless/demoSession";
import { useOnError } from "@/hooks/error";
import { useUser } from "@litespace/headless/context/user";

type Step = "date-selection" | "time-selection";

export enum Purpose {
  General = 1,
  Lesson = 2,
  Interview = 3,
}

export type Self = {
  id: number;
  userId: number;
  purpose: Purpose;
  start: string;
  end: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

const data: Self[] = [
  {
    id: 1,
    start: dayjs().add(2, "hours").toISOString(),
    end: dayjs().add(3, "hours").toISOString(),
    deleted: false,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
    purpose: Purpose.General,
    userId: 1,
  },
  {
    id: 2,
    start: dayjs().add(4, "hours").toISOString(),
    end: dayjs().add(5, "hours").toISOString(),
    deleted: false,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
    purpose: Purpose.General,
    userId: 1,
  },
  {
    id: 3,
    start: dayjs().add(6, "hours").toISOString(),
    end: dayjs().add(7, "hours").toISOString(),
    deleted: false,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
    purpose: Purpose.General,
    userId: 1,
  },
];

const DemoSession: React.FC = () => {
  const intl = useFormatMessage();

  const { user } = useUser();
  console.log("role ", user?.role);

  const [step, setStep] = useState<Step>("date-selection");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);

  const slots = useFindAvailabilitySlots({
    userIds: [1],
    after: dayjs().startOf("month").toISOString(),
    before: dayjs().endOf("month").toISOString(),
    full: true,
  });

  console.log({ slots });

  const onSuccess = useCallback(() => {
    console.log("success");
  }, []);
  const onError = useOnError({
    type: "mutation",
  });

  const createDemoSession = useCreateDemoSession({ onSuccess, onError });

  return (
    <div className="grow mt-[60px]">
      <div className="mb-8 flex flex-col gap-10 items-center">
        <div className="flex gap-4">
          <Typography tag="h1" className="text-brand-500 text-h4 font-bold">
            {intl("labels.litespace")}
          </Typography>
          <Logo className="w-14 h-14" />
        </div>
        <div className="flex flex-col gap-2 items-center text-center">
          <Typography tag="h3" className="text-h3 font-bold text-natural-950">
            {intl("tutor-onboarding.steps.demo-session.title")}
          </Typography>
          <Typography
            tag="p"
            className="text-tiny font-normal text-natural-700"
          >
            {intl("tutor-onboarding.steps.demo-session.desc")}
          </Typography>
        </div>
      </div>

      <Optional show={step === "date-selection"}>
        <DateSelection
          date={date}
          setDate={setDate}
          setStep={() => setStep("time-selection")}
        />
      </Optional>
      <Optional show={step === "time-selection"}>
        <TimeSelection
          date={date}
          time={time}
          data={data} // slots.data?.slots.list
          loading={false} // slots.isLoading
          error={false} // slots.isError
          retry={slots.refetch}
          setStep={() => setStep("date-selection")}
          setTime={setTime}
          book={(slotId) => {
            if (!time) return;
            console.log("booding...", { time });
            createDemoSession.mutate({ slotId, start: time?.toISOString() });
          }}
        />
      </Optional>
    </div>
  );
};

const DateSelection: React.FC<{
  date: Dayjs | null;
  setDate: (val: Dayjs) => void;
  setStep: Void;
}> = ({ date, setDate, setStep }) => {
  const intl = useFormatMessage();

  return (
    <div className="mx-auto flex flex-col gap-6 w-full max-w-[564px]">
      <MonthlyCalendar select={setDate} selected={date} />
      <Button
        size="large"
        endIcon={<ArrowLeft className="icon" />}
        onClick={() => setStep()}
        disabled={!date}
      >
        <Typography
          tag="span"
          className="text text-body font-medium text-natural-50"
        >
          {intl("labels.next")}
        </Typography>
      </Button>
    </div>
  );
};

const TimeSelection: React.FC<{
  date: Dayjs | null;
  time: Dayjs | null;
  data?: FindAvailabilitySlotsApiResponse["slots"]["list"];
  loading: boolean;
  error: boolean;
  retry: Void;
  setStep: Void;
  setTime: (val: Dayjs) => void;
  book: (slotId: number) => void;
}> = ({ date, time, data, error, loading, retry, setStep, setTime, book }) => {
  const intl = useFormatMessage();

  const [slotId, setSlotId] = useState<number>(0);

  if (loading)
    return (
      <Loading
        text={intl("tutor-onboarding.step.demo-session.loading-slots")}
      />
    );
  if (error)
    return (
      <LoadingError
        error={intl("tutor-onboarding.step.demo-session.slots-loading-error")}
        retry={retry}
      />
    );

  if (isEmpty(data))
    return (
      <Typography
        tag="p"
        className="text-center text-caption font-semibold text-natural-700"
      >
        {intl("tutor-onboarding.step.demo-session.empty-slots")}
      </Typography>
    );

  const slotsStartArr = data?.map((slot) => dayjs(slot.start).get("hour"));

  return (
    <div className="max-w-[540px] mx-auto">
      <div className="grid grid-cols-6 justify-center text-center gap-y-[10px] gap-x-3">
        {date
          ? Array(24)
              .fill(0)
              .map((_, index) => {
                const hour = dayjs(date)
                  .startOf("day")
                  .add(index, "hours")
                  .get("hour");

                const available = slotsStartArr?.includes(hour);

                const active = dayjs(time).get("hour") === hour;

                const id = data?.find(
                  (slot) => dayjs(slot.start).get("hour") === hour
                )?.id;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!available || !id) return;
                      setTime(dayjs(date).startOf("day").add(index, "hours"));
                      setSlotId(id);
                    }}
                    className={cn(
                      "border border-natural-200 h-20 w-20 rounded-lg shadow-date-selection-item",
                      "flex justify-center items-center",
                      available
                        ? "opacity-100 hover:cursor-pointer "
                        : "opacity-50 hover:cursor-not-allowed",
                      active
                        ? "bg-brand-500 text-natural-50 hover:bg-brand-600 active:bg-brand-500"
                        : "bg-natural-50",
                      {
                        "hover:bg-natural-100 active:bg-natural-300":
                          available && !active,
                      }
                    )}
                  >
                    {dayjs(date)
                      .startOf("day")
                      .add(index, "hours")
                      .format("hh:mm a")}
                  </div>
                );
              })
          : null}
      </div>
      <div className="mt-10 flex gap-[14px] max-w-[280px] w-full">
        <Button
          size="large"
          startIcon={<ArrowRight className="icon" />}
          onClick={() => setStep()}
          className="flex-1"
        >
          <Typography
            tag="span"
            className="ms-2 text text-body font-medium text-natural-50"
          >
            {intl("labels.prev")}
          </Typography>
        </Button>
        <Button
          size="large"
          onClick={() => book(slotId)}
          className="flex-1"
          disabled={!slotId}
        >
          <Typography
            tag="span"
            className="text text-body font-medium text-natural-50"
          >
            {intl("labels.confirm")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

const BookedSession: React.FC<{ tutorName: string; tutorImage: string }> = ({
  tutorName,
  tutorImage,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="border border-natural-100 rounded-lg p-4">
      <div>
        <Typography
          tag="h4"
          className="text-subtitle-2 font-bold text-natural-950"
        >
          {intl("tutor-onboarding.step.demo-session.booked.title")}
        </Typography>
        <div>
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <Avatar src={tutorImage} />
          </div>
          <Typography tag="p" className="text-tiny text-natural-700">
            {intl("tutor-onboarding.step.demo-session.booked.tutor-manager", {
              name: tutorName,
            })}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default DemoSession;
