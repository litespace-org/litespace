import { Loading, LoadingError } from "@litespace/ui/Loading";
import Header from "@/components/TutorOnboarding/Steps/Interview/Header";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Void } from "@litespace/types";

const InterviewLoading: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="mx-auto flex flex-col gap-8 pt-[60px]">
      <Header />
      <Loading
        size="small"
        text={intl("tutor-onboarding.step.interview.loading")}
      />
    </div>
  );
};

const InterviewErrorLoading: React.FC<{ refetch: Void }> = ({ refetch }) => {
  const intl = useFormatMessage();

  return (
    <div className="mx-auto flex flex-col gap-8 pt-[60px]">
      <Header />
      <LoadingError
        size="small"
        retry={refetch}
        error={intl("tutor-onboarding.step.interview.error")}
      />
    </div>
  );
};

export { InterviewLoading, InterviewErrorLoading };
