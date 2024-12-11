import { Avatar } from "@/components/Avatar";
import { Menu, MenuAction } from "@/components/Menu";
import {
  CardProps,
  StarProps,
  TutorCardProps,
} from "@/components/TutorCard/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { LocalId } from "@/locales";
import EditMessage16X16 from "@litespace/assets/EditMessage16X16";
import More from "@litespace/assets/More";
import Quote from "@litespace/assets/Quote";
import SStar from "@litespace/assets/SStar";
import Trash from "@litespace/assets/Trash";
import { orUndefined } from "@litespace/sol/utils";
import cn from "classnames";
import { range } from "lodash";
import React, { useMemo } from "react";

const ratingMap: { [key: number]: LocalId } = {
  0: "rating.bad",
  1: "rating.accepted",
  2: "rating.good",
  3: "rating.very-good",
  4: "rating.excellent",
};

export const TutorCard: React.FC<TutorCardProps> = ({
  profileId,
  studentId,
  studentName,
  tutorName,
  comment,
  imageUrl,
  rating,
  editSetOpen,
  deleteSetOpen,
}) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(
    () => [
      {
        label: intl("student-dashboard.rating.edit"),
        icon: <EditMessage16X16 />,
        onClick: () => editSetOpen(true),
      },
      {
        label: intl("student-dashboard.rating.delete"),
        icon: <Trash />,
        onClick: () => deleteSetOpen(true),
      },
    ],
    [intl, editSetOpen, deleteSetOpen]
  );

  const isCommentOwner = useMemo(() => {
    return studentId === profileId;
  }, [studentId, profileId]);

  return (
    <div className="tw-relative">
      <Card
        studentName={studentName}
        studentId={studentId}
        imageUrl={imageUrl}
        comment={comment}
        isCommentOwner={isCommentOwner}
        rating={rating}
        tutorName={tutorName}
        actions={actions}
        editSetOpen={editSetOpen}
      />
    </div>
  );
};

export const RatingStars: React.FC<StarProps> = ({
  isCommentOwner,
  comment,
  rating,
  editOpened = false,
  readonly = false,
  newRating = rating,
  className,
  setNewRate,
}) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "tw-self-center tw-flex tw-gap-2",
        isCommentOwner && !editOpened ? "tw-order-3" : "",
        editOpened && !readonly ? "tw-order-2" : "",
        editOpened && readonly ? "tw-order-0" : ""
      )}
    >
      {range(5).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "tw-w-5 tw-h-5",
            !comment && !readonly && editOpened ? "tw-w-5 tw-h-5" : "",
            comment && !editOpened ? "tw-w-5 tw-h-5" : "",
            !comment && !editOpened ? "tw-w-[38px] tw-h-[38px]" : ""
          )}
          style={{
            width: editOpened && readonly ? "50px" : "",
            height: editOpened && readonly ? "50px" : "",
          }}
        >
          <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
            <SStar
              className={cn(
                !editOpened && idx + 1 <= rating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300",
                editOpened && idx + 1 <= newRating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300",
                className
              )}
              onClick={() => setNewRate(idx + 1)}
            />
            {editOpened && readonly ? (
              <Typography
                element="caption"
                weight="regular"
                className="tw-text-natural-950"
              >
                {intl(ratingMap[idx])}
              </Typography>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  imageUrl,
  studentName,
  studentId,
  isCommentOwner,
  comment,
  rating,
  tutorName,
  actions,
  editOpened = false,
  className,
}) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-relative tw-h-full tw-flex tw-flex-col tw-justify-between tw-items-center",
        "tw-bg-natural-50 tw-p-6 tw-shadow-lesson-event-card tw-rounded-3xl",
        "tw-max-w-64",
        className
      )}
      style={{ gap: editOpened ? "16px" : "24px" }}
    >
      {isCommentOwner && actions ? (
        <div className="tw-absolute tw-z-10 tw-w-6 tw-h-6 tw-overflow-hidden tw-top-4 tw-left-4 tw-flex tw-justify-center tw-items-center">
          <Menu actions={actions}>
            <More />
          </Menu>
        </div>
      ) : null}

      <div
        className={cn(
          "tw-flex tw-justify-center tw-items-center tw-gap-2",
          isCommentOwner ? "tw-order-1" : ""
        )}
      >
        <div
          className={cn(
            "tw-relative tw-rounded-full tw-shrink-0 tw-border-[3px] tw-border-brand-500"
          )}
          style={{
            width: editOpened ? "82px" : "129px",
            height: editOpened ? "82px" : "129px",
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
              "tw-bg-brand-500 tw-rounded-full tw-absolute tw-flex tw-justify-center tw-items-center tw-z-5"
            )}
            style={{
              width: editOpened ? "42px" : "56px",
              height: editOpened ? "42px" : "56px",
              right: editOpened ? "-7.5px" : "-4.5px",
              bottom: editOpened ? "-7.5px" : "-12px",
            }}
          >
            <Quote />
          </div>
        </div>
      </div>

      <RatingStars
        isCommentOwner={isCommentOwner}
        rating={rating}
        comment={comment}
        setNewRate={() => {}}
        readonly={false}
        editOpened={editOpened || false}
      />
      <div
        className={cn(
          "tw-line-clamp-5 tw-text-center",
          isCommentOwner ? "tw-order-2" : ""
        )}
      >
        <Typography
          element="tiny-text"
          weight={!comment && editOpened ? "semibold" : "regular"}
          className={cn("tw-text-ellipsis tw-text-natural-600")}
        >
          {!comment && editOpened
            ? intl("student-dashboard.rating-dialog.add-comment")
            : comment}
        </Typography>
      </div>

      <Typography
        element="body"
        weight="bold"
        className={cn(
          "tw-text-brand-950 tw-text-center",
          isCommentOwner ? "tw-order-4" : ""
        )}
      >
        {studentName
          ? studentName
          : intl("student-dashboard.student-of", { value: tutorName })}
      </Typography>
    </div>
  );
};
