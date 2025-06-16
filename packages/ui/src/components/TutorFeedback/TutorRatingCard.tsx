import { AvatarV2 } from "@/components/Avatar";
import { Menu } from "@/components/Menu";
import { RatingCardProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import More from "@litespace/assets/More";
import Quote from "@litespace/assets/Quote";
import EditMessage from "@litespace/assets/EditMessage";
import Trash from "@litespace/assets/Trash";
import { RatingStars } from "@/components/RatingStars/RatingStars";
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
        "bg-natural-50 p-4 md:p-6 shadow-feedback-card rounded-2xl md:rounded-3xl",
        "relative flex flex-col items-center min-w-64",
        { "justify-between": !feedback },
        isEditing ? "w-64 md:h-[317px]" : "md:h-[317px] lg:h-[383px]",
        isEditing ? "gap-4" : "gap-4 lg:gap-6"
      )}
    >
      {owner ? (
        <div className="absolute z-10 w-6 h-6 overflow-hidden top-4 left-4 flex justify-center items-center">
          <Menu
            actions={[
              {
                label: intl("tutor.rating.edit"),
                icon: (
                  <EditMessage className="w-4 h-4 [&>*]:stroke-natural-600" />
                ),
                onClick: onEdit,
              },
              {
                label: intl("tutor.rating.delete"),
                icon: <Trash />,
                onClick: onDelete,
              },
            ]}
          >
            <More className="[&>*]:fill-natural-800 w-4 h-1" />
          </Menu>
        </div>
      ) : null}

      <div className={cn("flex justify-center items-center gap-2")}>
        <div
          className={cn(
            "relative rounded-full shrink-0 border-[3px] border-brand-500",
            isEditing
              ? "w-[82px] h-[82px]"
              : "w-[72px] h-[72px] md:w-[94px] md:h-[94px] lg:w-[129px] lg:h-[129px]"
          )}
        >
          <div className="overflow-hidden w-full h-full rounded-full">
            <AvatarV2 src={imageUrl} alt={studentName} id={studentId} />
          </div>
          <div
            className={cn(
              "bg-brand-500 rounded-full absolute flex justify-center items-center z-quote",
              isEditing
                ? "w-[42px] h-[42px] -right-[7.5px] -bottom-[7.5px]"
                : "w-8 h-8 md:w-[39px] md:h-[39px] lg:w-14 lg:h-14 -right-[12px] -bottom-[12px]"
            )}
          >
            <Quote className="w-[14px] h-[14px] md:w-6 md:h-6" />
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
            "line-clamp-5 text-center text-natural-800 font-semibold md:font-normal lg:font-semibold tiny"
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
          "text-brand-950 text-center font-bold text-caption lg:text-body",
          {
            "mt-auto": feedback,
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
