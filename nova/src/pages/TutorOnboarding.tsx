import React, { useMemo } from "react";
import { messages, Stepper } from "@litespace/luna";
import { useIntl } from "react-intl";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import cn from "classnames";
import ScheduleInterview from "@/components/ScheduleInterview";

const TutorOnboarding: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);

  const steps = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.first"],
        }),
        value: 1,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.second"],
        }),
        value: 2,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.third"],
        }),
        value: 3,
      },
    ];
  }, [intl]);

  return (
    <div className="max-w-screen-2xl mx-auto w-full py-12">
      <div className="mb-10">
        <Stepper steps={steps} value={1} />
      </div>

      <ScheduleInterview />
    </div>
  );
};

export default TutorOnboarding;
