import React, { MouseEventHandler } from "react";
import cn from "classnames";

import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { Button, ButtonType, ButtonVariant } from "@/components/Button";
import StarSVG from "@litespace/assets/Star";
import { FormattedMessage } from "react-intl";

type Props = {
  name: string;
  bio: string;
  about: string;
  studentsNumber: number;
  lessonsNumber: number;
  rating: number;
  imgSrc: string;
  profileUrl: string;
  onBook: MouseEventHandler<HTMLButtonElement>;
  onOpenProfile: MouseEventHandler<HTMLButtonElement>;
}

export const TutorCard: React.FC<Props> = (props) => {
  return (
    <div className={cn(
      "tw-flex tw-flex-col tw-max-w-96",
      "tw-bg-natural-50 tw-border-natural-100 tw-text-natural-800", 
      "tw-p-6 tw-w-min-auto tw-shadow-2xl tw-rounded-[20px]"
    )}>
      <div className="tw-flex tw-flex-row tw-mb-4">
        <Avatar src={props.imgSrc} className="tw-rounded-lg" />
        <div className="tw-mr-4">
          <Typography element="h4" className="tw-text-brand-700">{props.name}</Typography>
          <Typography element="body" className="tw-ellipsis tw-line-clamp-2">{props.bio}</Typography>
        </div>
      </div>

      <Typography element="subtitle-2" className="tw-ellipsis tw-line-clamp-2">{props.about}</Typography>
      <Typography element="subtitle-2" className="tw-ellipsis tw-line-clamp-2">
        <a href={props.profileUrl} className="tw-cursor-pointer tw-text-secondary-950 tw-underline">
          <FormattedMessage id="card.tutor.label.read-more" />
        </a>
      </Typography>

      <div className="tw-flex tw-flex-row tw-my-4">
        <div className="tw-flex tw-flex-col tw-m-auto tw-mr-0">
          <Typography element="body">
            <FormattedMessage id="card.tutor.label.students" />
          </Typography>
          <Typography element="body" className="tw-text-secondary-950">{props.studentsNumber}</Typography>
        </div>

        <div className="tw-flex tw-flex-col tw-m-auto">
          <Typography element="body">
            <FormattedMessage id="card.tutor.label.lessons" />
          </Typography>
          <Typography element="body" className="tw-text-secondary-950">{props.lessonsNumber}</Typography>
        </div>

        <div className="tw-flex tw-flex-col tw-m-auto">
          <Typography element="body">
            <FormattedMessage id="card.tutor.label.lessons" />
          </Typography>
          <div className="tw-flex tw-flex-row tw-items-center">
            <Typography element="body" className="tw-text-secondary-950 tw-ml-2">{props.rating}</Typography>
            <StarSVG />
          </div>
        </div>
      </div>

      <div className="tw-flex tw-flex-row">
        <Button
          onClick={props.onBook}
          className="tw-w-full tw-ml-2"
          type={ButtonType.Main}
          variant={ButtonVariant.Primary}
        >
          <FormattedMessage id="card.tutor.book-button.label" />
        </Button>
        <Button
          onClick={props.onOpenProfile}
          className="tw-w-full tw-mr-2"
          type={ButtonType.Main}
          variant={ButtonVariant.Secondary}
        >
          <FormattedMessage id="card.tutor.profile-button.label" />
        </Button>
      </div>
    </div>
  );
};
