import { Avatar } from "@/components/Avatar";
import { Menu } from "@/components/Menu";
import { RatingCardProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import More from "@litespace/assets/More";
import Quote from "@litespace/assets/Quote";
import EditMessage16X16 from "@litespace/assets/EditMessage16X16";
import Trash from "@litespace/assets/Trash";
import { RatingStars } from "@/components/RatingStars/RatingStars";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import React from "react";

export const TutorRatingCard: React.FC<RatingCardProps> = ({
  owner,
  studentId,
  studentName,
  tutorName,
  feedback,
  imageUrl,
  rating,
  isEditing = false,
  onEdit,
  onDelete,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-relative">
      <div
        className={cn(
          "tw-bg-natural-50 tw-p-6 tw-shadow-lesson-event-card tw-rounded-3xl",
          "tw-relative tw-flex tw-flex-col tw-items-center tw-min-w-64",
          { "tw-justify-between": !feedback },
          isEditing ? "tw-w-64 tw-h-[313px]" : "tw-h-[383px]",
          isEditing ? "tw-gap-4" : "tw-gap-6"
        )}
      >
        {owner ? (
          <div className="tw-absolute tw-z-10 tw-w-6 tw-h-6 tw-overflow-hidden tw-top-4 tw-left-4 tw-flex tw-justify-center tw-items-center">
            <Menu
              actions={[
                {
                  label: intl("tutor.rating.edit"),
                  icon: <EditMessage16X16 />,
                  onClick: onEdit,
                },
                {
                  label: intl("tutor.rating.delete"),
                  icon: <Trash />,
                  onClick: onDelete,
                },
              ]}
            >
              <More />
            </Menu>
          </div>
        ) : null}

        <div
          className={cn("tw-flex tw-justify-center tw-items-center tw-gap-2")}
        >
          <div
            className={cn(
              "tw-relative tw-rounded-full tw-shrink-0 tw-border-[3px] tw-border-brand-500",
              isEditing
                ? "tw-w-[82px] tw-h-[82px]"
                : "tw-w-[129px] tw-h-[129px]"
            )}
          >
            <div className="tw-overflow-hidden tw-w-full tw-h-full tw-rounded-full">
              <Avatar
                src={orUndefined(imageUrl)}
                alt={orUndefined(studentName)}
                seed={studentId.toString()}
              />
            </div>
            <div
              className={cn(
                "tw-bg-brand-500 tw-rounded-full tw-absolute tw-flex tw-justify-center tw-items-center tw-z-50",
                isEditing
                  ? "tw-w-[42px] tw-h-[42px] -tw-right-[7.5px] -tw-bottom-[7.5px]"
                  : "tw-w-14 tw-h-14 -tw-right-[12px] -tw-bottom-[12px]"
              )}
            >
              <Quote />
            </div>
          </div>
        </div>

        <RatingStars
          rating={rating}
          variant={!feedback && !isEditing ? "md" : "sm"}
          readonly
        />

        {!isEditing && !feedback ? null : (
          <Typography
            element="tiny-text"
            weight={!feedback && isEditing ? "semibold" : "regular"}
            className={cn("tw-line-clamp-5 tw-text-center tw-text-natural-600")}
          >
            {!feedback && isEditing
              ? intl("tutor.rating.feedback.placeholder")
              : feedback}
          </Typography>
        )}

        <Typography
          element="body"
          weight="bold"
          className={cn("tw-text-brand-950 tw-text-center", {
            "tw-mt-auto": feedback,
          })}
        >
          {studentName
            ? studentName
            : intl("tutor.rating.name.placeholder", { value: tutorName })}
        </Typography>
      </div>
    </div>
  );
};

export default TutorRatingCard;
