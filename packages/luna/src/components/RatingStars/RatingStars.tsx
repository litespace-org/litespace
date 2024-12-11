import React from "react";
import { range } from "lodash";
import { useFormatMessage } from "@/hooks/intl";
import SStar from "@litespace/assets/SStar";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { LocalId } from "@/locales";

type StarProps = {
  /**
   * comment of the student on the tutor
   */
  comment?: string | null;
  /**
   * average rating of the tutor
   */
  rating: number;
  /**
   * state shows weather stars can be clicked or not
   */
  readonly: boolean;
  /**
   * rating after update
   */
  newRating?: number;
  className?: string | null;
  /**
   * fn sets the rating value to the new one
   */
  setNewRate?: (newRate: number) => void;
};

const ratingMap: { [key: number]: LocalId } = {
  0: "rating.bad",
  1: "rating.accepted",
  2: "rating.good",
  3: "rating.very-good",
  4: "rating.excellent",
};

export const RatingStars: React.FC<StarProps> = ({
  comment,
  rating,
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
        !readonly ? "tw-gap-8" : null,
        !comment && readonly && rating ? "tw-gap-1" : null
      )}
    >
      {range(5).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "tw-w-5 tw-h-5",
            !comment && readonly ? "tw-w-5 tw-h-5" : null,
            comment && readonly ? "tw-w-5 tw-h-5" : null,
            readonly && !rating ? "tw-w-5 tw-h-5" : null,
            !comment && readonly && rating ? "tw-w-[38px] tw-h-[38px]" : null
          )}
          style={{
            width: !readonly ? "50px" : "",
            height: !readonly ? "50px" : "",
          }}
        >
          <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
            <SStar
              className={cn(
                readonly && idx + 1 <= rating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300",
                !readonly && idx + 1 <= newRating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300",
                className
              )}
              onClick={() => {
                if (!setNewRate) return;
                setNewRate(idx + 1);
              }}
            />
            {!readonly ? (
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
