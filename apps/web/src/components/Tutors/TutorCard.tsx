import { router } from "@/lib/routes";
import Star from "@litespace/assets/Star";
import { Void } from "@litespace/types";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Optional } from "@litespace/ui/Optional";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import { isEmpty } from "lodash";
import React from "react";
import { Link } from "react-router-dom";

const MAXIMUM_CARD_TOPICS_NUM = 4;

export const TutorCard: React.FC<{
  id?: string;
  tutorId: number;
  about: string | null;
  name: string | null;
  free?: boolean;
  image: string | null;
  rating?: number;
  topics: string[];
  onBook: Void;
}> = ({ id, tutorId, about, name, image, rating, free, topics, onBook }) => {
  const intl = useFormatMessage();

  return (
    <Link
      id={id}
      to={router.web({ route: Web.TutorProfile, id: tutorId })}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 @container block rounded-lg"
    >
      <div className="w-full border border-natural-200 rounded-lg p-4 flex flex-col gap-2 h-full">
        <div
          className={cn(
            "w-full h-80 max-h-80 @sm:h-[22rem] @sm:max-h-[22rem]",
            "@md:h-[26rem] @md:max-h-[26rem]",
            "@2md:h-[30rem] @2md:max-h-[30rem]",
            "@lg:h-[32rem] @lg:max-h-[32rem]",
            "@xl:h-[34rem] @xl:max-h-[34rem]",
            "@2xl:h-[37rem] @xl:max-h-[37rem]",
            "rounded-xl grow overflow-hidden relative"
          )}
        >
          {free ? <Free /> : null}
          <AvatarV2 src={image} alt={name} id={tutorId} object="cover" />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between mb-1">
            <Typography
              tag="h4"
              className="text-caption font-bold text-natural-950"
            >
              {name}
            </Typography>
            {rating ? <Rating rating={rating} /> : null}
          </div>
          <Optional show={!!about}>
            <Typography
              tag="p"
              className="text-tiny text-natural-800 line-clamp-1 mb-2"
            >
              {about}
            </Typography>
          </Optional>

          <Optional show={!isEmpty(topics)}>
            <div className="flex gap-1">
              {topics.map((topic, idx) => {
                if (idx <= MAXIMUM_CARD_TOPICS_NUM)
                  return (
                    <Tooltip
                      content={
                        <div className="flex flex-col">
                          {idx === MAXIMUM_CARD_TOPICS_NUM
                            ? topics
                                .slice(4)
                                .map((topic) => (
                                  <Typography tag="span">{topic}</Typography>
                                ))
                            : topic}
                        </div>
                      }
                    >
                      <div
                        className={cn(
                          "inline max-w-20 px-[6px] py-1 border border-natural-500 rounded-full",
                          "text-[10px] font-normal text-natural-500",
                          { truncate: idx < MAXIMUM_CARD_TOPICS_NUM }
                        )}
                      >
                        {idx < MAXIMUM_CARD_TOPICS_NUM
                          ? topic
                          : `${topics.length - idx}+`}
                      </div>
                    </Tooltip>
                  );
                else return;
              })}
            </div>
          </Optional>
        </div>

        <Button
          htmlType="button"
          className="w-full mt-auto text-body font-medium"
          size="medium"
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
    <div className="absolute px-3 py-[6px] z-free-badge top-4 right-0 flex items-center justify-center rounded-l-xl bg-natural-50 border-l border-t border-b border-natural-500">
      <Typography
        tag="span"
        className="text-natural-500 text-tiny font-semibold"
      >
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
