import React from "react";
import { Void } from "@litespace/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import Star from "@litespace/assets/Star";
import { useFormatMessage } from "@/hooks";

export const TutorCard: React.FC<{
  id: number;
  bio: string | null;
  name: string | null;
  free?: boolean;
  image: string | null;
  rating?: number;
  action: {
    label: string;
    onClick: Void;
  };
}> = ({ id, bio, name, image, action, rating, free }) => {
  const intl = useFormatMessage();

  return (
    <div className="h-[394px] focus-visible:ring-transparent w-full border border-natural-100 rounded-lg p-4 flex flex-col gap-4">
      <div className="w-full min-h-[225px] rounded-[10px] grow overflow-hidden relative">
        {free ? (
          <div className="absolute px-3 py-[6px] z-free-badge top-2 right-0 flex items-center justify-center rounded-l-full bg-brand-700 ">
            <Typography
              tag="span"
              className="text-natural-50 text-tiny font-semibold"
            >
              {intl("labels.free")}
            </Typography>
          </div>
        ) : null}
        <Avatar src={image} alt={name} seed={id} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Typography
            tag="h4"
            className="text-caption font-bold text-natural-950"
          >
            {name}
          </Typography>
          {rating ? (
            <div className="flex items-center gap-[5px]">
              <Typography
                className="text-xs font-semibold text-secondary-950"
                tag="span"
              >
                {rating}
              </Typography>
              <Star className="w-[15px] h-[15px]" />
            </div>
          ) : null}
        </div>
        <Typography className="text-tiny text-natural-800 line-clamp-1" tag="p">
          {bio}
        </Typography>
      </div>
      <Button
        className="w-full bg-brand-500"
        size="large"
        onClick={(e) => {
          e.preventDefault();
          action.onClick();
        }}
      >
        <Typography tag="span" className="text-body font-medium">
          {action.label}
        </Typography>
      </Button>
    </div>
  );
};
