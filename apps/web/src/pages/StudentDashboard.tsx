import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { SuggestedTutors } from "@/components/dashboard/SuggestedTutors";
import { useOnError } from "@/hooks/error";
import { router } from "@/lib/routes";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFindPersonalizedStudentStats } from "@litespace/headless/student";
import { Button } from "@litespace/ui/Button";
import { Loading } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Accordion } from "@litespace/ui/Accordion";
import { Web } from "@litespace/utils/routes";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTutors } from "@litespace/headless/tutor";
import { Tabs } from "@litespace/ui/Tabs";
import { track } from "@/lib/analytics";

const StudentDashboard: React.FC = () => {
  const mq = useMediaQuery();
  const intl = useFormatMessage();
  const tutors = useTutors();

  const { query, keys } = useFindPersonalizedStudentStats();
  const dashboardTutor = useMemo(() => {
    return tutors.list?.slice(0, 3) || [];
  }, [tutors.list]);

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  if (query.isLoading)
    return (
      <div className="mt-[40vh]">
        <Loading
          size={mq.sm ? "large" : "medium"}
          text={intl("student-dashboard.overview.loading")}
        />
      </div>
    );

  if (
    query.data?.completedLessonCount === 0 &&
    query.data?.upcomingLessonCount === 0
  )
    return <EmptyDashboard />;

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      {mq.lg ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <StudentOverview
              completedLessonCount={query.data?.completedLessonCount || 0}
              totalLearningTime={query.data?.completedLessonCount || 0}
              tutorCount={query.data?.tutorCount || 0}
              isError={query.isError}
              isPending={query.isLoading}
              refetch={query.refetch}
            />
            <Questions />

            <PastLessons />

            <SuggestedTutors
              tutors={dashboardTutor}
              loading={tutors.query.isLoading}
              error={tutors.query.isError}
              refetch={tutors.query.refetch}
            />
          </div>

          <div className="flex flex-col gap-6 lg:w-[312px] shrink-0">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : null}

      {!mq.lg ? (
        <div className="flex flex-col gap-4 w-full">
          <StudentOverview
            completedLessonCount={query.data?.completedLessonCount || 0}
            totalLearningTime={query.data?.completedLessonCount || 0}
            tutorCount={query.data?.tutorCount || 0}
            isError={query.isError}
            isPending={query.isLoading}
            refetch={query.refetch}
          />
          <LearningApproachMobile />
          <div className="flex-1">
            <UpcomingLessons />
          </div>
          <PastLessons />
          <SuggestedTutors
            tutors={dashboardTutor}
            loading={tutors.query.isLoading}
            error={tutors.query.isError}
            refetch={tutors.query.refetch}
          />
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-1 ">
              <ChatSummary />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const EmptyDashboard: React.FC = () => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div className="my-auto md:my-12 flex flex-col gap-3 mx-auto p-4">
      {md ? <Questions /> : null}
      {!md ? <LearningApproachMobile /> : null}
      <Link to={router.web({ route: Web.Tutors, full: true })} tabIndex={-1}>
        <Button
          className="w-full md:max-w-[250px] mx-auto"
          type="main"
          size="large"
        >
          {intl("student-dashboard.empty-state.btn")}
        </Button>
      </Link>
    </div>
  );
};

const Questions = () => {
  const [tab, setTab] = useState("methodology");
  const intl = useFormatMessage();

  const tabs = useMemo(
    () => [
      { id: "methodology", label: intl("questions.methodology-tab") },
      { id: "benefits", label: intl("questions.benefits-tab") },
    ],
    [intl]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="md:max-w-max md:mx-auto">
        <Tabs tabs={tabs} setTab={setTab} tab={tab} />
      </div>
      <div>
        {tab === "methodology" ? <Methodology /> : null}
        {tab === "benefits" ? <Benefits /> : null}
      </div>
    </div>
  );
};

const Methodology = () => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 grid gap-4 md:gap-8 md:grid-cols-3">
      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.methodology.card1.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.methodology.card1.desc")}
        </p>
      </div>

      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.methodology.card2.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.methodology.card2.desc")}
        </p>
      </div>

      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.methodology.card3.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.methodology.card3.desc")}
        </p>
      </div>
    </div>
  );
};

const Benefits = () => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 grid gap-4 md:gap-8 md:grid-cols-3">
      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.benefits.card1.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.benefits.card1.desc")}
        </p>
      </div>

      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.benefits.card2.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.benefits.card2.desc")}
        </p>
      </div>

      <div className="border shadow-md rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-2 text-natural-700">
          {intl("questions.benefits.card3.title")}
        </h2>
        <p className="text-natural-600 leading-relaxed text-sm">
          {intl("questions.benefits.card3.desc")}
        </p>
      </div>
    </div>
  );
};

const LearningApproachMobile = () => {
  const intl = useFormatMessage();

  const questions = useMemo(
    () => [
      {
        title: intl("questions.methodology.mobile-title"),
        content: intl("questions.methodology.mobile-content"),
      },
      {
        title: intl("questions.benefits.mobile-title"),
        content: intl("questions.benefits.mobile-content"),
      },
    ],
    [intl]
  );

  const items = useMemo(
    () =>
      questions.map(({ title, content }, i) => ({
        id: i.toString(),
        title,
        content,
      })),
    [questions]
  );

  return (
    <div className="block md:hidden">
      <Accordion
        onValueChange={(value) => {
          const item = items.find((item) => item.id === value);
          if (!item) return;
          track("view_web_faq", "student_dashboard", item.title);
        }}
        items={items}
      />
    </div>
  );
};

export default StudentDashboard;
