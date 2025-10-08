import { useOnError } from "@/hooks/error";
import { router } from "@/lib/routes";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import Calendar from "@litespace/assets/Calendar";
import Logo from "@litespace/assets/Logo";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import {
  useCancelDemoSession,
  useCreateDemoSession,
  useFindLastDemoSession,
} from "@litespace/headless/demoSession";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { IAvailabilitySlot, IDemoSession, IUser, Void } from "@litespace/types";
import { Avatar } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { MonthlyCalendar } from "@litespace/ui/MonthlyCalendar";
import { Optional } from "@litespace/ui/Optional";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import {
  DEMO_SESSION_DURATION,
  getSubSlots,
  subtractSlotsBatch,
} from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import dayjs, { Dayjs } from "dayjs";
import { first, isEmpty } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Step = "date-selection" | "time-selection" | "booked-session";

const DemoSession: React.FC<{ tutorId: number; next: Void }> = ({
  tutorId,
  next,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const [step, setStep] = useState<Step>("date-selection");
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [time, setTime] = useState<Dayjs | null>(null);

  const { query, keys } = useFindLastDemoSession(tutorId);

  const lastDemoSession = useMemo(() => {
    const demoSession = first(query.data?.list);
    if (demoSession?.status === IDemoSession.Status.Passed) next();
    return demoSession;
  }, [query.data, next]);

  const tutorQuery = useFindTutorInfo(lastDemoSession?.tutorId);

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  const onCancelSuccess = useCallback(() => {
    query.refetch();
    setStep("date-selection");
  }, [setStep, query]);

  const onCancelError = useOnError({
    type: "mutation",
    handler: ({ messageId }) =>
      toast.error({
        title: intl(messageId),
      }),
  });

  const cancelSession = useCancelDemoSession({
    onSuccess: onCancelSuccess,
    onError: onCancelError,
  });

  const slots = useFindAvailabilitySlots({
    purposes: [
      IAvailabilitySlot.Purpose.General,
      IAvailabilitySlot.Purpose.DemoSession,
    ],
    after: date.startOf("month").toISOString(),
    before: date.endOf("month").toISOString(),
    full: true,
    roles: [IUser.Role.TutorManager],
  });

  const onCreateSuccess = useCallback(() => {
    query.refetch();
  }, [query]);
  const onCreateError = useOnError({
    type: "mutation",
    handler: () => console.log("create error..."),
  });

  const subslots = useMemo(() => {
    if (!slots.data) return [];
    return subtractSlotsBatch({
      slots: slots.data.slots.list,
      subslots: slots.data.subslots,
    });
  }, [slots.data]);

  const createDemoSession = useCreateDemoSession({
    onSuccess: onCreateSuccess,
    onError: onCreateError,
  });

  if (query.isPending) return <Loading />;

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

      <Optional show={!!lastDemoSession}>
        <BookedSession
          demoSessionId={lastDemoSession?.id}
          tutorImage={tutorQuery.data?.image || ""}
          tutorName={tutorQuery.data?.name || ""}
          start={lastDemoSession?.start}
          cancel={() => {
            if (!lastDemoSession) return;
            cancelSession.mutate({
              id: lastDemoSession.id,
              status: IDemoSession.Status.CanceledByTutor,
            });
          }}
        />
      </Optional>

      <Optional show={step === "date-selection" && isEmpty(query.data?.list)}>
        <DateSelection
          date={date}
          setDate={setDate}
          setStep={() => setStep("time-selection")}
        />
      </Optional>

      <Optional show={step === "time-selection" && isEmpty(query.data?.list)}>
        <TimeSelection
          date={date}
          time={time}
          subslots={subslots}
          loading={slots.isLoading}
          error={slots.isError}
          retry={slots.refetch}
          setStep={() => setStep("date-selection")}
          setTime={setTime}
          book={(slotId) => {
            if (!time) return;
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
  subslots: IAvailabilitySlot.SubSlot[];
  loading: boolean;
  error: boolean;
  retry: Void;
  setStep: Void;
  setTime: (val: Dayjs) => void;
  book: (slotId: number) => void;
}> = ({
  date,
  time,
  subslots,
  error,
  loading,
  retry,
  setStep,
  setTime,
  book,
}) => {
  const intl = useFormatMessage();

  const [slotId, setSlotId] = useState<number>(0);

  const dateSlots = useMemo(
    () => subslots?.filter((slot) => dayjs(slot.start).isSame(date, "day")),
    [date, subslots]
  );

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

  if (
    isEmpty(
      subslots
        .filter((slot) => dayjs(slot.start).date() === date?.date())
        .filter((slot) => dayjs(slot.start).isAfter(dayjs()))
    )
  )
    return (
      <div className="flex flex-col gap-4 items-center">
        <Typography
          tag="p"
          className="text-center text-caption font-semibold text-natural-700"
        >
          {intl("tutor-onboarding.step.demo-session.empty-slots")}
        </Typography>
        <Button size="large" onClick={() => setStep()}>
          <Typography
            tag="span"
            className="text text-body font-medium text-natural-50"
          >
            {intl("tutor-onboarding.steps.choose-another-time")}
          </Typography>
        </Button>
      </div>
    );

  return (
    <div className="max-w-[540px] mx-auto">
      <div
        className={cn(
          "w-full grid grid-cols-6 justify-center text-center",
          "gap-y-[10px] gap-x-3"
        )}
      >
        {dateSlots?.map((slot, i) => {
          return (
            <React.Fragment key={i}>
              {i !== 0 ? (
                <div className="w-full h-full flex justify-center items-center">
                  <div className="w-2 h-2 bg-natural-700 rounded-full" />
                </div>
              ) : null}

              {getSubSlots(slot, 30).map((subslot, index) => {
                const active = dayjs(time).isSame(dayjs(subslot.start));

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setTime(dayjs(subslot.start));
                      setSlotId(slot.parent);
                    }}
                    className={cn(
                      "border border-natural-200 h-20 w-20 rounded-lg shadow-date-selection-item",
                      "flex justify-center items-center hover:cursor-pointer",
                      active
                        ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-500"
                        : "bg-natural-50 hover:bg-natural-100 active:bg-natural-300"
                    )}
                  >
                    <Typography
                      tag="span"
                      className={cn(
                        "text-tiny font-normal",
                        active ? "text-natural-50" : "text-natural-700"
                      )}
                    >
                      {dayjs(subslot.start).format("hh:mm a")}
                    </Typography>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
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

const BookedSession: React.FC<{
  demoSessionId?: number;
  tutorName: string;
  tutorImage: string;
  start?: string;
  cancel: Void;
}> = ({ demoSessionId, tutorName, tutorImage, start, cancel }) => {
  const intl = useFormatMessage();

  return (
    <div className="border border-natural-100 rounded-lg p-4 max-w-[490px] mx-auto">
      <div className="flex flex-col gap-1 mb-4">
        <Typography
          tag="h4"
          className="text-subtitle-2 font-bold text-natural-950"
        >
          {intl("tutor-onboarding.step.demo-session.booked.title")}
        </Typography>

        <div className="flex gap-2 items-center">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <Avatar src={tutorImage} />
          </div>

          <Typography
            tag="p"
            className="text-tiny text-natural-700 font-normal"
          >
            {intl("tutor-onboarding.step.demo-session.booked.tutor-manager", {
              name: tutorName,
            })}
          </Typography>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="p-[5px] bg-natural-800 rounded-full overflow-hidden">
          <Calendar className="w-6 h-6 [&>*]:stroke-natural-50" />
        </div>

        <div>
          <Typography
            tag="p"
            className="text-tiny font-normal text-natural-600"
          >
            {intl("tutor-onboarding.step.demo-session.date-and-time")}
          </Typography>

          <div className="flex items-center gap-3">
            <Typography tag="span" className="text-tiny font-semibold">
              {dayjs(start).format("dddd, DD MMMM, YYYY")}
            </Typography>

            <div className="w-1 h-1 bg-brand-700 rounded-full overflow-hidden" />

            <div className="flex items-center gap-2.5">
              <Typography tag="span" className="text-tiny font-semibold">
                {dayjs(start).format("hh:mm a")}
              </Typography>
              <span>-</span>
              <Typography tag="span" className="text-tiny font-semibold">
                {dayjs(start)
                  .add(DEMO_SESSION_DURATION, "minutes")
                  .format("hh:mm a")}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <Typography tag="p" className="text-tiny text-warning-700 my-6">
        {intl("tutor-onboarding.step.demo-session.can-cancel-session.desc")}
      </Typography>

      <div className="flex gap-4">
        <Link
          to={router.web({ route: Web.DemoSession, id: demoSessionId || 0 })}
          className="flex-1"
        >
          <Button size="large" className="w-full">
            {intl("tutor-onboarding.step.demo-session.enter-session")}
          </Button>
        </Link>

        <Button
          size="large"
          variant="secondary"
          className="flex-1"
          onClick={cancel}
        >
          {intl("tutor-onboarding.step.demo-session.cancel-session")}
        </Button>
      </div>
    </div>
  );
};

export default DemoSession;
