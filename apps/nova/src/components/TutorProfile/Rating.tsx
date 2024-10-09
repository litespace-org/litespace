import { Card, asFullAssetUrl } from "@litespace/luna";
import { IRating } from "@litespace/types";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Star } from "react-feather";

const Rating: React.FC<{ rating: IRating.Populated }> = ({ rating }) => {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-3">
          <div className="w-12 h-12">
            <img
              className="w-full h-full object-cover"
              src={
                rating.rater.image
                  ? asFullAssetUrl(rating.rater.image)
                  : "/avatar-1.png"
              }
            />
          </div>
          <div>
            <p>{rating.rater.name}</p>
            <p className="text-base text-foreground-light flex items-center">
              <p className="flex flex-row items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
                <span>{rating.value}</span>
              </p>
              &nbsp;
              <span className="border-2 border-dotted border-foreground-light rounded-full" />
              &nbsp;
              <p>{dayjs(rating.createdAt).fromNow()}</p>
            </p>
          </div>
        </div>
        <p>{rating.feedback}</p>
      </div>
    </Card>
  );
};

export default Rating;
