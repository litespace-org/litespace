import React from "react";
import cn from "classnames";
import { Accordion } from "@litespace/ui/Accordion";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@/hooks/intl";
import Link from "next/link";

const Content: React.FC<{ role: "student" | "tutor" }> = ({ role }) => {
  const intl = useFormatMessage();

  const tutorQuestions = [
    {
      title: intl("faq/body/for-tutor/question/1"),
      answer: (
        <>
          {intl("faq/body/for-tutor/question/1/answer-1")}{" "}
          <Link
            className="text-blue-900"
            href="https://app.litespace.org/tutor/register"
          >
            {intl("faq/body/for-tutor/question/1/answer-2")}
          </Link>
          {intl("faq/body/for-tutor/question/1/answer-3")}
        </>
      ),
    },
    {
      title: intl("faq/body/for-tutor/question/2"),
      answer: intl("faq/body/for-tutor/question/2/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/3"),
      answer: intl("faq/body/for-tutor/question/3/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/4"),
      answer: intl("faq/body/for-tutor/question/4/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/5"),
      answer: intl("faq/body/for-tutor/question/5/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/6"),
      answer: intl("faq/body/for-tutor/question/6/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/7"),
      answer: intl("faq/body/for-tutor/question/7/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/8"),
      answer: intl("faq/body/for-tutor/question/8/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/9"),
      answer: intl("faq/body/for-tutor/question/9/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/10"),
      answer: (
        <>
          {intl("faq/body/for-tutor/question/10/answer-1")}{" "}
          <Link className="text-blue-900" href="https://t.me/litespace_tutors">
            {intl("faq/body/for-tutor/question/10/answer-2")}
          </Link>
          {intl("faq/body/for-tutor/question/10/answer-3")}{" "}
        </>
      ),
    },
    {
      title: intl("faq/body/for-tutor/question/11"),
      answer: intl("faq/body/for-tutor/question/11/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/12"),
      answer: intl("faq/body/for-tutor/question/12/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/13"),
      answer: intl("faq/body/for-tutor/question/13/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/14"),
      answer: intl("faq/body/for-tutor/question/14/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/15"),
      answer: intl("faq/body/for-tutor/question/15/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/16"),
      answer: intl("faq/body/for-tutor/question/16/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/17"),
      answer: intl("faq/body/for-tutor/question/17/answer"),
    },
    {
      title: intl("faq/body/for-tutor/question/18"),
      answer: intl("faq/body/for-tutor/question/18/answer"),
    },
  ];

  const studentQuestions = [
    {
      title: intl("faq/body/for-student/question/1"),
      answer: intl("faq/body/for-student/question/1/answer"),
    },
    {
      title: intl("faq/body/for-student/question/2"),
      answer: (
        <>
          {intl("faq/body/for-student/question/2/answer-1")}{" "}
          <Link className="text-blue-900" href="http://litespace.org/pricing">
            {intl("faq/body/for-student/question/2/answer-2")}
          </Link>
        </>
      ),
    },
    {
      title: intl("faq/body/for-student/question/3"),
      answer: intl("faq/body/for-student/question/3/answer"),
    },
    {
      title: intl("faq/body/for-student/question/4"),
      answer: intl("faq/body/for-student/question/4/answer"),
    },
    {
      title: intl("faq/body/for-student/question/5"),
      answer: intl("faq/body/for-student/question/5/answer"),
    },
    {
      title: intl("faq/body/for-student/question/6"),
      answer: (
        <>
          {intl("faq/body/for-student/question/6/answer-1")}{" "}
          <Link className="text-blue-900" href="https://litespace.org/terms">
            {intl("faq/body/for-student/question/6/answer-2")}
          </Link>
        </>
      ),
    },
    {
      title: intl("faq/body/for-student/question/7"),
      answer: (
        <>
          {intl("faq/body/for-student/question/7/answer-1")}{" "}
          <Link className="text-blue-900" href="http://litespace.org/pricing">
            {intl("faq/body/for-student/question/7/answer-2")}
          </Link>
        </>
      ),
    },
    {
      title: intl("faq/body/for-student/question/8"),
      answer: intl("faq/body/for-student/question/8/answer"),
    },
    {
      title: intl("faq/body/for-student/question/9"),
      answer: intl("faq/body/for-student/question/9/answer"),
    },
    {
      title: intl("faq/body/for-student/question/10"),
      answer: intl("faq/body/for-student/question/10/answer"),
    },
    {
      title: intl("faq/body/for-student/question/11"),
      answer: intl("faq/body/for-student/question/11/answer"),
    },
    {
      title: intl("faq/body/for-student/question/12"),
      answer: intl("faq/body/for-student/question/12/answer"),
    },
    {
      title: intl("faq/body/for-student/question/13"),
      answer: intl("faq/body/for-student/question/13/answer"),
    },
    {
      title: intl("faq/body/for-student/question/14"),
      answer: intl("faq/body/for-student/question/14/answer"),
    },
    {
      title: intl("faq/body/for-student/question/15"),
      answer: intl("faq/body/for-student/question/15/answer"),
    },
    {
      title: intl("faq/body/for-student/question/16"),
      answer: intl("faq/body/for-student/question/16/answer"),
    },
    {
      title: intl("faq/body/for-student/question/17"),
      answer: intl("faq/body/for-student/question/17/answer"),
    },
    {
      title: intl("faq/body/for-student/question/18"),
      answer: intl("faq/body/for-student/question/18/answer"),
    },
    {
      title: intl("faq/body/for-student/question/19"),
      answer: intl("faq/body/for-student/question/19/answer"),
    },
    {
      title: intl("faq/body/for-student/question/20"),
      answer: intl("faq/body/for-student/question/20/answer"),
    },
  ];

  const questions = role === "tutor" ? tutorQuestions : studentQuestions;

  return (
    <div
      className={cn(
        "flex flex-col py-14 sm:py-20 md:py-20 px-4 md:px-8 lg:px-[108px] gap-8 sm:gap-14 lg:gap-20",
        "max-w-screen-3xl mx-auto w-full"
      )}
    >
      <div className="flex flex-col gap-4 text-center">
        <Typography tag="h1" className="text-h4 font-bold">
          <Typography tag="span" className="text-brand-500">
            {intl("faq/body/title/1")}
          </Typography>{" "}
          <Typography tag="span" className="text-natural-950">
            {intl("faq/body/title/2")}
          </Typography>
        </Typography>
        <Typography
          tag="p"
          className="text-subtitle-2 font-semibold text-natural-700"
        >
          {intl("faq/body/description")}
        </Typography>
      </div>

      <Accordion
        items={questions.map((obj, i) => ({
          id: i,
          title: obj.title,
          content: obj.answer,
        }))}
      />

      <div className="text-center">
        <Typography tag="h3" className="text-caption font-medium">
          {role === "tutor" ? (
            <>
              {intl("faq/body/are-you-student")}{" "}
              <Link href="/faq/student" className="text-brand-700">
                {intl("faq/body/go-to-students-questions")}
              </Link>
            </>
          ) : (
            <>
              {intl("faq/body/are-you-tutor")}{" "}
              <Link href="/faq/tutor" className="text-brand-700">
                {intl("faq/body/go-to-tutors-questions")}
              </Link>
            </>
          )}
        </Typography>
      </div>
    </div>
  );
};

export default Content;
