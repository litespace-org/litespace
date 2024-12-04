import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import Quote from "@litespace/assets/Quote";

export const TutorRatingCard: React.FC<{
  imageUrl: string;
  name: string;
  id: number;
  feedback: string;
}> = ({ imageUrl, name, feedback, id }) => {
  return (
    <div
      className={cn(
        "tw-bg-natural-50 tw-rounded-3xl tw-p-8 tw-shadow-rating-card tw-w-[265px] tw-h-[379px]",
        "tw-flex tw-flex-col tw-gap-[21px] tw-items-center"
      )}
    >
      <div className="tw-relative">
        <div className="tw-border-[3px] tw-border-brand-500 tw-rounded-full tw-overflow-hidden tw-w-[129px] tw-h-[129px]">
          <Avatar
            src={orUndefined(imageUrl)}
            alt={orUndefined(name)}
            seed={id.toString()}
          />
          <div className="tw-w-14 tw-absolute tw-z-10 -tw-bottom-2 -tw-right-2 tw-h-14 tw-bg-brand-500 tw-rounded-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center">
            <Quote />
          </div>
        </div>
      </div>
      <Typography
        element="tiny-text"
        className="tw-text-natural-600 tw-text-center tw-truncate tw-whitespace-normal"
      >
        "{feedback}"
      </Typography>
      <div className="tw-flex tw-flex-col tw-items-center tw-grow tw-gap-[21px] tw-justify-end">
        <div className="tw-w-[9px] tw-h-[9px] tw-rounded-full tw-bg-brand-500" />
        <Typography
          element="body"
          className="tw-text-natural-950 tw-font-bold tw-justify-self-end"
        >
          {name}
        </Typography>
      </div>
    </div>
  );
};

export default TutorRatingCard;
