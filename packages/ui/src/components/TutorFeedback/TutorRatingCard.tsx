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
import { orUndefined } from "@litespace/utils/utils";
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
    <div
      className={cn(
        "tw-bg-natural-50 tw-p-4 md:tw-p-6 tw-shadow-feedback-card tw-rounded-3xl",
        "tw-relative tw-flex tw-flex-col tw-items-center tw-min-w-64",
        { "tw-justify-between": !feedback },
        isEditing ? "tw-w-64 md:tw-h-[313px]" : "md:tw-h-[383px]",
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
            <More className="[&>*]:tw-fill-natural-800" />
          </Menu>
        </div>
      ) : null}

      <div className={cn("tw-flex tw-justify-center tw-items-center tw-gap-2")}>
        <div
          className={cn(
            "tw-relative tw-rounded-full tw-shrink-0 tw-border-[3px] tw-border-brand-500",
            isEditing
              ? "tw-w-[82px] tw-h-[82px]"
              : "md:tw-w-[129px] md:tw-h-[129px] tw-w-[72px] tw-h-[72px]"
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
              "tw-bg-brand-500 tw-rounded-full tw-absolute tw-flex tw-justify-center tw-items-center tw-z-quote",
              isEditing
                ? "tw-w-[42px] tw-h-[42px] -tw-right-[7.5px] -tw-bottom-[7.5px]"
                : "md:tw-w-14 md:tw-h-14 -tw-right-[12px] -tw-bottom-[12px] tw-w-8 tw-h-8"
            )}
          >
            <Quote className="md:tw-w-6 md:tw-h-6 tw-w-[14px] tw-h-[14px]" />
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
          tag="span"
          className={cn(
            "tw-line-clamp-5 tw-text-center tw-text-natural-800 tw-font-semibold tw-tiny"
          )}
        >
          {!feedback && isEditing
            ? intl("tutor.rating.feedback.placeholder")
            : feedback}
        </Typography>
      )}

      <Typography
        tag="span"
        className={cn(
          "tw-text-brand-950 tw-text-center tw-font-bold tw-text-body md:tw-text-caption",
          {
            "tw-mt-auto": feedback,
          }
        )}
      >
        {studentName
          ? studentName
          : intl("tutor.rating.name.placeholder", { value: tutorName })}
      </Typography>
    </div>
  );
};

export default TutorRatingCard;
