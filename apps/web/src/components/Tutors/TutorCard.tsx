import React from "react";
import { Void } from "@litespace/types";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import Star from "@litespace/assets/Star";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatNumber } from "@litespace/ui/utils";
import { Link } from "react-router-dom";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import { Optional } from "@litespace/ui/Optional";

export const TutorCard: React.FC<{
  id: number;
  bio: string | null;
  name: string | null;
  free?: boolean;
  image: string | null;
  rating?: number;
  onBook: Void;
}> = ({ id, bio, name, image, rating, free, onBook }) => {
  const intl = useFormatMessage();
  return (
    <Link
      to={router.web({ route: Web.TutorProfile, id })}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 @container block rounded-lg"
    >
      <div className="w-full border border-natural-100 rounded-lg p-4 flex flex-col gap-4 h-full">
        <div
          className={cn(
            "w-full h-80 max-h-80 @sm:h-[22rem] @sm:max-h-[22rem]",
            "@md:h-[26rem] @md:max-h-[26rem]",
            "@2md:h-[30rem] @2md:max-h-[30rem]",
            "@lg:h-[32rem] @lg:max-h-[32rem]",
            "@xl:h-[34rem] @xl:max-h-[34rem]",
            "@2xl:h-[37rem] @xl:max-h-[37rem]",
            "rounded-[10px] grow overflow-hidden relative"
          )}
        >
          {free ? <Free /> : null}
          <AvatarV2 src={image} alt={name} id={id} object="cover" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Typography
              tag="h4"
              className="text-caption font-bold text-natural-950"
            >
              {name}
            </Typography>
            {rating ? <Rating rating={rating} /> : null}
          </div>
          <Optional show={!!bio}>
            <Typography
              tag="p"
              className="text-tiny text-natural-800 line-clamp-1"
            >
              {bio}
            </Typography>
          </Optional>
        </div>

        <Button
          htmlType="button"
          className="w-full mt-auto text-body font-medium"
          size="large"
          onClick={(event) => {
            event.preventDefault();
            onBook();
          }}
        >
          {intl("tutor-card.book-now")}
        </Button>
      </div>
    </Link>
  );
};

const Free: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="absolute px-3 py-[6px] z-free-badge top-2 right-0 flex items-center justify-center rounded-l-full bg-natural-50 border-l border-t border-b border-brand-500">
      <Typography tag="span" className="text-brand-500 text-tiny font-semibold">
        {intl("tutor-card.free")}
      </Typography>
    </div>
  );
};

const Rating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      <Typography
        className="text-tiny font-semibold text-secondary-950"
        tag="span"
      >
        {formatNumber(rating, {
          maximumFractionDigits: 1,
        })}
      </Typography>
      <Star className="w-[15px] h-[15px] [&>*]:fill-warning-500" />
    </div>
  );
};
