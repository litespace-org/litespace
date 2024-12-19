import { Avatar } from "@/components/Avatar";
import { CardProps } from "@/components/TutorCard/types";
import cn from "classnames";
import React from "react";
// import { faker } from "@faker-js/faker/locale/ar";
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
  // bio,
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
  return (
    <div
      className={cn(
        "tw-flex tw-gap-4",
        "tw-bg-natural-50 tw-border tw-border-natural-100",
        "tw-p-4 tw-shadow-ls-small tw-rounded-lg"
      )}
    >
      <div className="tw-rounded-lg tw-overflow-hidden tw-shrink-0 tw-w-[200px] _tw-h-[246px]">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      <div>
        <div className="tw-flex tw-flex-row tw-gap-2">
          <div>
            <div>
              <Typography
                element="subtitle-1"
                weight="bold"
                className="tw-text-brand-700 tw-mb-2 tw-line-clamp-1"
              >
                {name}
              </Typography>
            </div>
          </div>
        </div>

        <Typography
          element="caption"
          weight="semibold"
          className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800"
        >
          {about}
        </Typography>

        <Link to={profileUrl} className="tw-cursor-pointer">
          <Typography
            element="caption"
            weight="semibold"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-950 tw-underline"
          >
            {intl("tutors.card.label.read-more")}
          </Typography>
        </Link>

        {studentCount && lessonCount && rating ? (
          <div className={cn("tw-flex tw-gap-8 tw-my-4")}>
            <div className="tw-flex tw-flex-col">
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
          </div>
        ) : null}
        <div
          className="tw-flex tw-mt-[15px] tw-bg-red-600 tw-gap-2 tw-flex-wrap"
          style={{ background: "yellow" }}
        >
          {topics
            ? topics.map((topic, idx) => (
                <Typography
                  key={idx}
                  element="tiny-text"
                  weight="regular"
                  className="tw-inline-block tw-text-natural-50 tw-bg-brand-700 tw-px-3 tw-py-2 tw-rounded-3xl"
                >
                  {topic}
                </Typography>
              ))
            : null}
        </div>
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
