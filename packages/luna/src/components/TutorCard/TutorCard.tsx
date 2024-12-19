import React from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@/components/Button";
import Star from "@litespace/assets/Star";
import { useFormatMessage } from "@/hooks";
import { formatNumber } from "@/components/utils";
import { Link } from "react-router-dom";
import { orUndefined } from "@litespace/sol/utils";
import { Void } from "@litespace/types";
import { Tooltip } from "@/components/Tooltip";

type Props = {
  id: number;
  name: string | null;
  bio: string | null;
  about: string | null;
  studentCount: number;
  lessonCount: number;
  rating: number;
  imageUrl?: string | null;
  profileUrl: string;
  onBook: Void;
  onOpenProfile: Void;
};

export const TutorCard: React.FC<Props> = ({
  id,
  name,
  bio,
  about,
  imageUrl,
  lessonCount,
  studentCount,
  profileUrl,
  rating,
  onBook,
  onOpenProfile,
}) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-flex tw-flex-col",
        "tw-bg-natural-50 tw-border tw-border-natural-100",
        "tw-p-4 tw-shadow-ls-x-small tw-rounded-lg"
      )}
    >
      <div className="tw-flex tw-flex-row tw-gap-2 tw-mb-4">
        <div className="tw-rounded-lg tw-overflow-hidden tw-shrink-0 tw-w-[77px] tw-h-[77px]">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
        </div>
        <div>
          <Tooltip
            content={
              <Typography className="tw-text-natural-950">{name}</Typography>
            }
          >
            <div>
              <Typography
                element="subtitle-2"
                weight="bold"
                className="tw-text-brand-700 tw-mb-2 tw-line-clamp-1"
              >
                {name}
              </Typography>
            </div>
          </Tooltip>
          <Typography
            element="tiny-text"
            className="tw-ellipsis tw-line-clamp-2 tw-text-natural-800"
          >
            {bio}
          </Typography>
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

      <div className="tw-flex tw-flex-row tw-gap-8 tw-my-4">
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

      <div className="tw-flex tw-flex-row tw-gap-3">
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
  );
};
