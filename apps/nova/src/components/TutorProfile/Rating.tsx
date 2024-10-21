import {
  Button,
  ButtonSize,
  ButtonType,
  Card,
  asFullAssetUrl,
} from "@litespace/luna";
import { IRating } from "@litespace/types";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Edit, Star, Trash2 } from "react-feather";
import { profileSelectors } from "@/redux/user/profile";
import { useAppSelector } from "@/redux/store";

const Rating: React.FC<{
  rating: IRating.Populated;

  onEdit: (rating: IRating.Populated) => void;
  onDelete: ({
    ratingId,
    tutorId,
  }: {
    ratingId: number;
    tutorId: number;
  }) => void;
}> = ({ rating, onEdit, onDelete }) => {
  const profile = useAppSelector(profileSelectors.user);

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-3">
          <div className="w-12 h-12">
            <img
              className="object-cover w-full h-full"
              src={
                rating.rater.image
                  ? asFullAssetUrl(rating.rater.image)
                  : "/avatar-1.png"
              }
            />
          </div>
          <div className="grow">
            <p>{rating.rater.name}</p>
            <p className="flex items-center text-base text-foreground-light">
              <p className="flex flex-row items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
                <span>{rating.value}</span>
              </p>
              &nbsp;
              <span className="border-2 border-dotted rounded-full border-foreground-light" />
              &nbsp;
              <p>{dayjs(rating.createdAt).fromNow()}</p>
            </p>
          </div>
          {profile?.id === rating.rater.id ? (
            <div className="flex gap-3">
              <Button
                onClick={() => onEdit(rating)}
                size={ButtonSize.Tiny}
                type={ButtonType.Primary}
              >
                <Edit className="w-4 text-white" />
              </Button>
              <Button
                onClick={() =>
                  onDelete({
                    ratingId: rating.id,
                    tutorId: rating.ratee.id,
                  })
                }
                size={ButtonSize.Tiny}
                type={ButtonType.Primary}
              >
                <Trash2 className="w-4 text-white" />
              </Button>
            </div>
          ) : null}
        </div>
        <p>{rating.feedback}</p>
      </div>
    </Card>
  );
};

export default Rating;
