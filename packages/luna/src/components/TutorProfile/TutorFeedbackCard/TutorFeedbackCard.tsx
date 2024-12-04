import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import Quote from "@litespace/assets/Quote";

export const TutorFeedbackCard: React.FC<{
  imageUrl: string | null;
  name: string | null;
  id: number;
  feedback: string;
}> = ({ imageUrl, name, feedback, id }) => {
  return (
    <div
      className={cn(
        "tw-bg-natural-50 tw-rounded-3xl tw-p-8 tw-shadow-feedback-card tw-w-[265px] tw-h-[379px]",
        "tw-flex tw-flex-col tw-gap-[21px] tw-items-center",
        "dark:tw-bg-secondary-900 dark:tw-border dark:tw-border-secondary-800 dark:tw-shadow-dark-feedback-card"
      )}
    >
      <div className="tw-relative">
        <div className="tw-border-[3px] tw-border-brand-500 tw-rounded-full tw-overflow-hidden tw-w-[129px] tw-h-[129px] dark:tw-border-brand-400">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
          <div className="tw-w-14 tw-absolute tw-z-10 -tw-bottom-2 -tw-right-2 tw-h-14 tw-bg-brand-500 tw-rounded-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center dark:tw-bg-brand-400">
            <Quote />
          </div>
        </div>
      </div>
      <Typography
        element="tiny-text"
        className="tw-text-natural-600 tw-text-center tw-truncate tw-whitespace-normal dark:tw-text-natural-100"
      >
        "{feedback}"
      </Typography>
      <div className="tw-flex tw-flex-col tw-items-center tw-grow tw-gap-[21px] tw-justify-end">
        <div className="tw-w-[9px] tw-h-[9px] tw-rounded-full tw-bg-brand-500 dark:tw-bg-brand-400" />
        <Typography
          element="body"
          className="tw-text-natural-950 tw-font-bold dark:tw-text-natural-50"
        >
          {name}
        </Typography>
      </div>
    </div>
  );
};

export default TutorFeedbackCard;
