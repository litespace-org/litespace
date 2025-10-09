import React from "react";
import cn from "classnames";
import Accordion from "@/components/Common/Accordion";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@/hooks/intl";
import Link from "@/components/Common/Link";
import { router } from "@/lib/routes";
import { Landing, Web } from "@litespace/utils/routes";
import { LITESPACE_TUTORS_TELEGRAM } from "@/constants/links";

type Question = {
  title: string;
  content: string | React.ReactNode;
};

export const Content: React.FC<{
  role?: "student" | "tutor";
  home?: boolean;
}> = ({ role, home }) => {
  const intl = useFormatMessage();

  const sharedQuestions: Question[] = [
    {
      title: intl("faq/body/general/q/7"),
      content: intl("faq/body/general/q/7/answer"),
    },
    {
      title: intl("faq/body/for-student/q/1"),
      content: intl("faq/body/for-student/q/1/answer"),
    },
    {
      title: intl("faq/body/for-student/q/2"),
      content: intl.rich("faq/body/for-student/q/2/answer", {
        here: (chunks) => (
          <Link
            track={{
              action: "view_pricing",
              category: "home",
              label: "from_faq",
            }}
            className="text-brand-700"
            href={Landing.Pricing}
          >
            {chunks}
          </Link>
        ),
      }),
    },
    {
      title: intl("faq/body/general/q/1"),
      content: intl("faq/body/general/q/1/answer"),
    },
    {
      title: intl("faq/body/for-student/q/3"),
      content: intl("faq/body/for-student/q/3/answer"),
    },
    {
      title: intl("faq/body/general/q/4"),
      content: intl("faq/body/general/q/4/answer"),
    },
    // {
    //   title: intl("faq/body/general/q/5"),
    //   content: intl("faq/body/general/q/5/answer"),
    // },
    {
      title: intl("faq/body/general/q/6"),
      content: intl("faq/body/general/q/6/answer"),
    },
    {
      title: intl("faq/body/general/q/8"),
      content: intl("faq/body/general/q/8/answer"),
    },
    {
      title: intl("faq/body/general/q/9"),
      content: intl("faq/body/general/q/9/answer"),
    },
  ];

  const tutorQuestions: Question[] = [
    {
      title: intl("faq/body/for-tutor/q/1"),
      content: intl.rich("faq/body/for-tutor/q/1/answer", {
        here: (chunks) => (
          <Link
            track={{
              action: "click_register",
              category: "home",
              label: "from_faq",
            }}
            className="text-brand-700"
            href={router.web({
              route: Web.Register,
              role: "tutor",
              full: true,
            })}
          >
            {chunks}
          </Link>
        ),
      }),
    },
    {
      title: intl("faq/body/for-tutor/q/2"),
      content: intl("faq/body/for-tutor/q/2/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/3"),
      content: intl("faq/body/for-tutor/q/3/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/4"),
      content: intl("faq/body/for-tutor/q/4/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/5"),
      content: intl("faq/body/for-tutor/q/5/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/6"),
      content: intl("faq/body/for-tutor/q/6/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/7"),
      content: intl("faq/body/for-tutor/q/7/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/8"),
      content: intl("faq/body/for-tutor/q/8/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/9"),
      content: intl("faq/body/for-tutor/q/9/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/10"),
      content: intl.rich("faq/body/for-tutor/q/10/answer", {
        telegram: (chunks) => (
          <Link
            className="text-brand-700"
            href={LITESPACE_TUTORS_TELEGRAM}
            target="_blank"
          >
            {chunks}
          </Link>
        ),
      }),
    },
    {
      title: intl("faq/body/for-tutor/q/11"),
      content: intl("faq/body/for-tutor/q/11/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/12"),
      content: intl("faq/body/for-tutor/q/12/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/13"),
      content: intl("faq/body/for-tutor/q/13/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/14"),
      content: intl("faq/body/for-tutor/q/14/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/15"),
      content: intl("faq/body/for-tutor/q/15/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/16"),
      content: intl("faq/body/for-tutor/q/16/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/17"),
      content: intl("faq/body/for-tutor/q/17/answer"),
    },
    {
      title: intl("faq/body/for-tutor/q/18"),
      content: intl("faq/body/for-tutor/q/18/answer"),
    },
  ];

  const studentQuestions: Question[] = [
    {
      title: intl("faq/body/for-student/q/4"),
      content: intl("faq/body/for-student/q/4/answer"),
    },
    {
      title: intl("faq/body/for-student/q/5"),
      content: intl("faq/body/for-student/q/5/answer"),
    },
    {
      title: intl("faq/body/for-student/q/6"),
      content: intl.rich("faq/body/for-student/q/6/answer", {
        terms: (chunks) => (
          <Link className="text-brand-700" href={Landing.Terms}>
            {chunks}
          </Link>
        ),
      }),
    },
    {
      title: intl("faq/body/for-student/q/7"),
      content: intl.rich("faq/body/for-student/q/7/answer", {
        here: (chunks) => (
          <Link
            track={{
              action: "view_pricing",
              category: "home",
              label: "from_faq",
            }}
            className="text-brand-700"
            href={Landing.Pricing}
          >
            {chunks}
          </Link>
        ),
      }),
    },
    {
      title: intl("faq/body/for-student/q/8"),
      content: intl("faq/body/for-student/q/8/answer"),
    },
    {
      title: intl("faq/body/for-student/q/9"),
      content: intl("faq/body/for-student/q/9/answer"),
    },
    {
      title: intl("faq/body/for-student/q/10"),
      content: intl("faq/body/for-student/q/10/answer"),
    },
    {
      title: intl("faq/body/for-student/q/11"),
      content: intl("faq/body/for-student/q/11/answer"),
    },
    {
      title: intl("faq/body/for-student/q/12"),
      content: intl("faq/body/for-student/q/12/answer"),
    },
    {
      title: intl("faq/body/for-student/q/13"),
      content: intl("faq/body/for-student/q/13/answer"),
    },
    {
      title: intl("faq/body/for-student/q/14"),
      content: intl("faq/body/for-student/q/14/answer"),
    },
    {
      title: intl("faq/body/for-student/q/15"),
      content: intl("faq/body/for-student/q/15/answer"),
    },
    {
      title: intl("faq/body/for-student/q/16"),
      content: intl("faq/body/for-student/q/16/answer"),
    },
    {
      title: intl("faq/body/for-student/q/17"),
      content: intl("faq/body/for-student/q/17/answer"),
    },
    {
      title: intl("faq/body/for-student/q/18"),
      content: intl("faq/body/for-student/q/18/answer"),
    },
    {
      title: intl("faq/body/for-student/q/19"),
      content: intl("faq/body/for-student/q/19/answer"),
    },
    {
      title: intl("faq/body/for-student/q/20"),
      content: intl("faq/body/for-student/q/20/answer"),
    },
  ];

  const userQuestions = role === "tutor" ? tutorQuestions : studentQuestions;
  const questions = sharedQuestions.concat(home ? [] : userQuestions);

  return (
    <div className="bg-natural-0 md:py-18 lg:py-24 max-w-screen-3xl mx-auto">
      <div
        className={cn(
          "flex flex-col py-14 sm:py-20 md:py-20 px-4 md:px-8 lg:px-[108px] gap-8 sm:gap-14 lg:gap-20",
          "max-w-screen-3xl mx-auto w-full"
        )}
      >
        <div className="flex flex-col gap-4 text-center">
          <Typography tag="h1" className="text-subtitle-2 sm:text-h4 font-bold">
            <Typography tag="span" className="text-brand-500">
              {intl("faq/body/title/1")}
            </Typography>{" "}
            <Typography tag="span" className="text-natural-950">
              {intl("faq/body/title/2")}
            </Typography>
          </Typography>
          <Typography
            tag="p"
            className="text-body sm:text-subtitle-2 font-semibold text-natural-700"
          >
            {intl("faq/body/description")}
          </Typography>
        </div>

        <Accordion
          items={questions.map(({ title, content }, i) => ({
            id: i.toString(),
            title,
            content,
          }))}
        />

        {role ? (
          <div className="text-center">
            <Typography tag="h3" className="text-caption font-medium">
              {intl.rich(
                role === "student"
                  ? "faq/body/are-you-tutor"
                  : "faq/body/are-you-student",
                {
                  link: (chunks) => (
                    <Link
                      href={router.landing({
                        route: Landing.FaqRole,
                        role: role === "student" ? "tutor" : "student",
                      })}
                      className="text-brand-700"
                    >
                      {chunks}
                    </Link>
                  ),
                }
              )}
            </Typography>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Content;
