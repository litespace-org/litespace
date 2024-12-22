import { Avatar } from "@/components/Avatar";
import { CardProps } from "@/components/TutorCard/types";
import cn from "classnames";
import React, { useMemo } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@/components/Button";
import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import Star from "@litespace/assets/Star";
import { orUndefined } from "@litespace/sol/utils";
import { Link } from "react-router-dom";

export const TutorCardV1: React.FC<CardProps> = ({
  id,
  name,
  about,
  imageUrl,
  lessonCount,
  studentCount,
  profileUrl,
  rating,
  topics,
  onBook,
  onOpenProfile,
}) => {
  const intl = useFormatMessage();
  const doubleTopicLines = useMemo(
    () => !studentCount && !lessonCount && !rating,
    [lessonCount, rating, studentCount]
  );
  return (
    <div
      className={cn(
        "tw-bg-natural-50 tw-flex tw-gap-4",
        "tw-border tw-border-transparent hover:tw-border hover:tw-border-natural-100",
        "tw-p-4 tw-shadow-ls-small tw-rounded-lg"
      )}
    >
      <div className="tw-rounded-lg tw-overflow-hidden tw-shrink-0 tw-w-[200px] ![&>*>img]:tw-object-fill">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      <div>
        <Typography
          element="subtitle-1"
          weight="bold"
          className="tw-text-brand-700 tw-mb-1 tw-line-clamp-1"
        >
          {name}
        </Typography>

        <Typography
          element="caption"
          weight="regular"
          className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800"
        >
          {about}
        </Typography>
        <Link to={profileUrl} className="tw-cursor-pointer">
          <Typography
            element="caption"
            weight="bold"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800 tw-underline"
          >
            {intl("tutors.card.label.read-more")}
          </Typography>
        </Link>

        {!doubleTopicLines ? (
          <div className={cn("tw-flex tw-gap-8 tw-my-4")}>
            {studentCount ? (
              <div className="tw-flex tw-flex-col">
                {" "}
                <Typography element="body">
                  {intl("tutors.card.label.students")}
                </Typography>
                <Typography
                  element="body"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {formatNumber(studentCount)}
                </Typography>
              </div>
            ) : null}

            {lessonCount ? (
              <div className="tw-flex tw-flex-col">
                <Typography element="body">
                  {intl("tutors.card.label.lessons")}
                </Typography>
                <Typography
                  element="body"
                  weight="semibold"
                  className="tw-text-natural-950"
                >
                  {formatNumber(lessonCount)}
                </Typography>
              </div>
            ) : null}

            {rating ? (
              <div className="tw-flex tw-flex-col">
                <Typography element="body">
                  {intl("tutors.card.label.rating")}
                </Typography>
                <div className="tw-flex tw-flex-row tw-items-center">
                  <Typography
                    element="body"
                    weight="semibold"
                    className="tw-text-natural-950"
                  >
                    {rating}
                  </Typography>
                  <Star />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {topics ? (
          <div
            className={cn(
              "tw-flex tw-mt-[15px] tw-gap-2 tw-justify-start",
              doubleTopicLines ? "tw-flex-wrap" : null
            )}
          >
            {topics.map((topic, idx, arr) => {
              if (doubleTopicLines && idx <= 7)
                return (
                  <Typography
                    key={idx}
                    element="tiny-text"
                    weight="regular"
                    className="tw-block tw-grow-1 tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl"
                  >
                    {idx < 7 ? topic : null}
                    {idx === 7
                      ? intl("labels.plus", { value: arr.length - idx })
                      : null}
                  </Typography>
                );

              if (!doubleTopicLines && idx <= 4)
                return (
                  <Typography
                    key={idx}
                    element="tiny-text"
                    weight="regular"
                    className="tw-inline-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl"
                  >
                    {idx < 4 ? topic : null}
                    {idx === 4
                      ? intl("labels.plus", { value: arr.length - idx })
                      : null}
                  </Typography>
                );
            })}
          </div>
        ) : null}
        <div className="tw-flex tw-flex-row tw-gap-3 tw-mt-4">
          <Button
            onClick={onBook}
            className="tw-w-full"
            type={ButtonType.Main}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Tiny}
          >
            {intl("tutors.card.book-button.label")}
          </Button>
          <Button
            onClick={onOpenProfile}
            className="tw-w-full"
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Tiny}
          >
            {intl("tutors.card.profile-button.label")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorCardV1;
