import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Stepper, atlas, useFormatMessage } from "@litespace/luna";
import { TutorOnboardingStep } from "@/constants/user";
import TutorOnboardingSteps from "@/components/TutorOnboardingSteps";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { tutorMetaSelector } from "@/redux/user/tutor";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IInterview } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

const TutorOnboarding: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.user);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(-1);

  const steps = useMemo(() => {
    return [
      {
        label: intl("page.tutor.onboarding.steps.first"),
        value: TutorOnboardingStep.Interview,
      },
      {
        label: intl("page.tutor.onboarding.steps.second"),
        value: TutorOnboardingStep.Media,
      },
      {
        label: intl("page.tutor.onboarding.steps.third"),
        value: TutorOnboardingStep.Profile,
      },
    ];
  }, [intl]);

  const findInterviews = useCallback(async () => {
    if (!profile) return { list: [], total: 0 };
    return await atlas.interview.findInterviews({ user: profile.id });
  }, [profile]);

  const interviews = useQuery({
    queryFn: findInterviews,
    enabled: !!profile,
    queryKey: ["find-interviews"],
  });

  const current = useMemo(() => {
    if (!interviews.data) return null;
    const interview = maxBy(interviews.data.list, (item) =>
      dayjs(item.interview.createdAt).unix()
    );
    return interview || null;
  }, [interviews.data]);

  useEffect(() => {
    const pending = current?.interview.status === IInterview.Status.Pending;
    const passed = current?.interview.status === IInterview.Status.Passed;
    const rejected = current?.interview.status === IInterview.Status.Rejected;
    const canceled = current?.interview.status === IInterview.Status.Canceled;
    const signed = !!current?.interview.signer;

    if (
      interviews.data &&
      (!current || pending || rejected || canceled || !signed)
    )
      return setStep(TutorOnboardingStep.Interview);

    if (
      profile &&
      tutorMeta &&
      (tutorMeta.video === null || profile?.image === null)
    )
      return setStep(TutorOnboardingStep.Media);

    if (tutorMeta && (tutorMeta.bio === null || tutorMeta.about === null))
      return setStep(TutorOnboardingStep.Profile);

    if (
      interviews.data &&
      current &&
      passed &&
      signed &&
      profile &&
      tutorMeta &&
      tutorMeta.bio &&
      tutorMeta.about &&
      profile.image &&
      tutorMeta.video
    )
      return navigate(Route.Root);
  }, [current, interviews.data, navigate, profile, tutorMeta]);

  return (
    <div className="max-w-screen-2xl px-8 mx-auto w-full py-12">
      <div className="mb-10">
        <Stepper steps={steps} value={step} />
      </div>

      <div>
        <TutorOnboardingSteps
          step={step}
          interviews={interviews}
          current={current}
        />
      </div>
    </div>
  );
};

export default TutorOnboarding;
