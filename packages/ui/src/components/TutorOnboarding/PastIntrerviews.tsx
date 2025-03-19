import { Void } from "@litespace/types";
import { type Interview } from "@/components/TutorOnboarding/types";
import { useFormatMessage } from "@/hooks";
import { Avatar } from "@/components/Avatar";
import dayjs from "@/lib/dayjs";
import { Loader, LoadingError } from "@/components/Loading";
import { InView } from "react-intersection-observer";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";

export const PreviousInterviews: React.FC<{
  interviews?: Array<Interview>;
  loading: boolean;
  error: boolean;
  more: Void;
}> = ({ interviews, loading, error, more }) => {
  const intl = useFormatMessage();

  return (
    <div className="mt-5">
      <Typography
        tag="h3"
        className="text-subtitle-2 font-bold text-black mb-6"
      >
        {intl("tutor.onboarding.previous-interviews.title")}
      </Typography>
      {loading ? (
        <Loader
          size="medium"
          text={intl("tutor.onboarding.previous-interviews.loading")}
        />
      ) : null}
      {error ? (
        <LoadingError
          size="medium"
          error={intl("tutor.onboarding.previous-interviews.error")}
          retry={() => {}}
        />
      ) : null}
      {!loading && !error && interviews ? (
        <div className="flex flex-col gap-1">
          {interviews.map((interview, idx) => (
            <Interview interview={interview} key={idx} />
          ))}
        </div>
      ) : null}
      <InView
        onChange={(inview) => {
          if (inview) more();
        }}
      />
    </div>
  );
};

const Interview: React.FC<{
  interview: Interview;
}> = ({ interview }) => {
  const intl = useFormatMessage();
  const text = useMemo(() => {
    if (interview.feedback) return interview.feedback;
    if (
      interview.canceledBy &&
      interview.canceledBy === "canceled-by-tutor-manager"
    )
      return intl(
        "tutor.onboarding.previous-interviews.cancelled-by-tutor-manage"
      );
    return intl("tutor.onboarding.previous-interviews.cancelled-by-you");
  }, [intl, interview]);

  return (
    <div className="flex gap-[14px] bg-natural-50 border border-natural-100 shadow shadow-previous-interview p-4 rounded-[10px]">
      <div className="w-12 h-12 shrink-0 overflow-hidden rounded-full">
        <Avatar
          src={interview.tutorManager.image}
          alt={interview.tutorManager.name}
          seed={interview.tutorManager.id}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Typography tag="h5" className="text-body font-bold text-natural-950">
          {intl("tutor.onboarding.previous-interviews.person", {
            tutor: interview.tutorManager.name,
          })}
        </Typography>
        <Typography tag="p" className="text-natural-600 text-tiny">
          {text}
        </Typography>
        <Typography tag="p" className="text-natural-600 text-tiny">
          {dayjs(interview.date).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
      </div>
    </div>
  );
};
