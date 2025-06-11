import Star from "@litespace/assets/Star";
import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import { Button } from "@litespace/ui/Button";
import Link from "@/components/Common/Link";
import cn from "classnames";

export const TutorCard: React.FC<{
  id: number;
  name: string | null;
  about: string | null;
  imageUrl: string | null;
  rating: number;
  profileUrl: string;
  free?: boolean;
}> = ({ id, name, about, imageUrl, profileUrl, rating, free }) => {
  const intl = useFormatMessage();

  return (
    <Link
      href={profileUrl}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 @container block rounded-lg"
    >
      <div className="w-full border border-natural-100 rounded-lg p-4 flex flex-col gap-2 h-full">
        <div
          className={cn(
            "w-full h-80 max-h-80 @sm:h-[22rem] @sm:max-h-[22rem]",
            "@md:h-[26rem] @md:max-h-[26rem]",
            "@2md:h-[30rem] @2md:max-h-[30rem]",
            "@lg:h-[32rem] @lg:max-h-[32rem]",
            "@xl:h-[34rem] @xl:max-h-[34rem]",
            "@2xl:h-[37rem] @xl:max-h-[37rem]",
            "rounded-t-[10px] grow overflow-hidden relative"
          )}
        >
          {free ? <Free /> : null}
          <AvatarV2 src={imageUrl} alt={name} id={id} object="cover" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <Typography
              tag="h4"
              className="text-caption font-bold text-natural-950"
            >
              {name}
            </Typography>
            {rating ? <Rating rating={rating} /> : null}
          </div>
          <Typography
            tag="p"
            className="text-tiny text-natural-800 line-clamp-1"
          >
            {about}
          </Typography>
        </div>

        <Button htmlType="button" className="w-full mt-auto" size="large">
          <Typography tag="span" className="text-body font-medium">
            {intl("home/tutors/card/book-now")}
          </Typography>
        </Button>
      </div>
    </Link>
  );
};

const Free: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="absolute px-3 py-[6px] z-free-badge top-4 right-0 flex items-center justify-center rounded-l-[12px] bg-natural-0 border-l border-t border-b border-brand-500">
      <Typography tag="span" className="text-brand-500 text-tiny font-semibold">
        {intl("home/tutors/card/free")}
      </Typography>
    </div>
  );
};

const Rating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      <Typography
        className="text-tiny font-normal text-secondary-950"
        tag="span"
      >
        {formatNumber(rating, {
          maximumFractionDigits: 2,
        })}
      </Typography>
      <Star className="w-[15px] h-[15px] [&>*]:fill-warning-500" />
    </div>
  );
};

export default TutorCard;
