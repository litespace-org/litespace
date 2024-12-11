import { Avatar } from "@/components/Avatar";
import { Menu } from "@/components/Menu";
import { RatingCardProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import More from "@litespace/assets/More";
import Quote from "@litespace/assets/Quote";
import { RatingStars } from "@/components/RatingStars/RatingStars";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import React, { useMemo } from "react";

export const TutorRatingCard: React.FC<RatingCardProps> = ({
  profileId,
  studentId,
  studentName,
  tutorName,
  comment,
  imageUrl,
  rating,
  actions,
  className,
  active,
}) => {
  const intl = useFormatMessage();
  const isCommentOwner = useMemo(() => {
    return studentId === profileId;
  }, [studentId, profileId]);

  return (
    <div className="tw-relative">
      <div
        className={cn(
          "tw-relative tw-h-full tw-flex tw-flex-col tw-justify-between tw-items-center",
          "tw-bg-natural-50 tw-p-6 tw-shadow-lesson-event-card tw-rounded-3xl",
          "tw-max-w-64",
          className
        )}
        style={{ gap: active ? "16px" : "24px" }}
      >
        {isCommentOwner && actions ? (
          <div className="tw-absolute tw-z-10 tw-w-6 tw-h-6 tw-overflow-hidden tw-top-4 tw-left-4 tw-flex tw-justify-center tw-items-center">
            <Menu actions={actions}>
              <More />
            </Menu>
          </div>
        ) : null}

        <div
          className={cn("tw-flex tw-justify-center tw-items-center tw-gap-2")}
        >
          <div
            className={cn(
              "tw-relative tw-rounded-full tw-shrink-0 tw-border-[3px] tw-border-brand-500"
            )}
            style={{
              width: active ? "82px" : "129px",
              height: active ? "82px" : "129px",
            }}
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
                "tw-bg-brand-500 tw-rounded-full tw-absolute tw-flex tw-justify-center tw-items-center tw-z-50"
              )}
              style={{
                width: active ? "42px" : "56px",
                height: active ? "42px" : "56px",
                right: active ? "-7.5px" : "-4.5px",
                bottom: active ? "-7.5px" : "-12px",
              }}
            >
              <Quote />
            </div>
          </div>
        </div>

        <RatingStars rating={rating} comment={comment} readonly={true} />

        <div className={cn("tw-line-clamp-5 tw-text-center")}>
          <Typography
            element="tiny-text"
            weight={!comment && active ? "semibold" : "regular"}
            className={cn("tw-text-ellipsis tw-text-natural-600")}
          >
            {!comment && active
              ? intl("student-dashboard.rating-dialog.add-comment")
              : comment}
          </Typography>
        </div>

        <Typography
          element="body"
          weight="bold"
          className={cn("tw-text-brand-950 tw-text-center")}
        >
          {studentName
            ? studentName
            : intl("student-dashboard.student-of", { value: tutorName })}
        </Typography>
      </div>
    </div>
  );
};

export default TutorRatingCard;
