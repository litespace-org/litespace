import {
  Button,
  ButtonSize,
  ButtonType,
  Card,
  asFullAssetUrl,
  useFormatMessage,
} from "@litespace/luna";
import { IRating } from "@litespace/types";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Edit, Star, Trash2 } from "react-feather";
import { useRender } from "@/hooks/render";
import EditRating from "./EditRating";

const Rating: React.FC<{ rating: IRating.Populated }> = ({ rating }) => {
  const edit = useRender();
  const deleteRating = useRender();
  const intl = useFormatMessage();
  const showEditDialog = ()=> edit.show();
  const showDeleteDialog = () => deleteRating.show()
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
          <div className="flex gap-3">
            <Button onClick={showEditDialog} size={ButtonSize.Tiny} type={ButtonType.Primary}>
              <Edit className="w-4 text-white" />
            </Button>
            <Button onClick={showDeleteDialog} size={ButtonSize.Tiny} type={ButtonType.Primary}>
              <Trash2 className="w-4 text-white" />
            </Button>
          </div>
        </div>
        <p>{rating.feedback}</p>
        <EditRating
          open={edit.open}
          close={edit.hide}
          rate={rating}
          title={intl("tutor.rate.editmessage")}
        />
      </div>
    </Card>
  );
};

export default Rating;
