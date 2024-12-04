import React from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Star from "@litespace/assets/Star";
import { Button } from "@/components/Button";

export const TutorProfileCard: React.FC<{
  imageUrl: string;
  name: string;
  id: number;
  bio: string;
  studentCount: number;
  lessonCount: number;
  rating: number;
}> = ({ imageUrl, name, id, bio, studentCount, lessonCount, rating }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-gap-10">
      <div className="tw-w-[242px] tw-h-[242px] tw-rounded-full tw-overflow-hidden">
        <Avatar
          src={orUndefined(imageUrl)}
          alt={orUndefined(name)}
          seed={id.toString()}
        />
      </div>
      <div>
        <Typography element="h2" className="tw-font-bold tw-text-natural-950">
          {name}
        </Typography>
        <Typography
          element="subtitle-2"
          className="tw-text-natural-950 tw-font-semibold"
        >
          {bio}
        </Typography>
        <Typography
          element="subtitle-2"
          className="tw-text-natural-950 tw-font-semibold"
        >
          {intl("tutor.achievements", { lessonCount, studentCount })}
        </Typography>
        <div className="tw-flex tw-items-center tw-gap-2">
          <Typography
            element="subtitle-2"
            className="tw-text-natural-950 tw-font-semibold"
          >
            {rating}
          </Typography>
          <Star className="[&>*]:tw-fill-warning-500" />
        </div>
        <Button className="tw-w-full">{intl("tutor.book")}</Button>
      </div>
    </div>
  );
};

export default TutorProfileCard;
