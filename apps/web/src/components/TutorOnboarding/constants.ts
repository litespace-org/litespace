import { LocalId } from "@litespace/ui/locales";
import { StepId } from "@/components/TutorOnboarding/types";

export const ONBOARDING_STEPS: Array<{
  id: StepId;
  title: LocalId;
  desc: LocalId;
}> = [
  {
    id: "intro-video",
    title: "tutor-onboarding.steps.intro-video.title",
    desc: "tutor-onboarding.steps.intro-video.desc",
  },
  {
    id: "interview",
    title: "tutor-onboarding.steps.interview.title",
    desc: "tutor-onboarding.steps.interview.desc",
  },
  {
    id: "demo-session",
    title: "tutor-onboarding.steps.demo-session.title",
    desc: "tutor-onboarding.steps.demo-session.desc",
  },
  {
    id: "photo-session",
    title: "tutor-onboarding.steps.photo-session.title",
    desc: "tutor-onboarding.steps.photo-session.desc",
  },
] as const;

export const ONBOARDING_STEP_ID_TO_ORDER: Record<StepId, number> = {
  "intro-video": 1,
  interview: 2,
  "demo-session": 3,
  "photo-session": 4,
};
