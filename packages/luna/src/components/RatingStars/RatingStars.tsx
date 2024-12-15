import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales";
import SStar from "@litespace/assets/SStar";
import cn from "classnames";
import { range } from "lodash";
import React from "react";

type StarProps = {
  /**
   * rating is number bet 1 to 5 default is zero
   */
  rating: number;
  /**
   * represents the size of star
   * sm "20*20" md "38*38" lg "50*51"
   */
  variant?: "sm" | "md" | "lg";
  /**
   * state shows weather stars can be clicked or not
   */
  readonly: boolean;
  setRating?: (newRating: number) => void;
};

const ratingMap: { [key: number]: LocalId } = {
  0: "rating.bad",
  1: "rating.accepted",
  2: "rating.good",
  3: "rating.very-good",
  4: "rating.excellent",
};

export const RatingStars: React.FC<StarProps> = ({
  rating,
  readonly = true,
  variant = "sm",
  setRating,
}) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "tw-flex tw-p-0",
        { "tw-gap-2": variant === "sm" },
        { "tw-gap-1": variant === "md" },
        { "tw-gap-8": variant === "lg" }
      )}
    >
      {range(5).map((idx) => (
        <div key={idx} className={cn("tw-flex tw-flex-col tw-gap-4")}>
          <div
            className={cn(
              { "tw-w-5 tw-h-5": variant === "sm" },
              { "tw-w-[38px] tw-h-[38px]": variant === "md" },
              { "tw-w-[51px] tw-h-[50px]": variant === "lg" }
            )}
          >
            <SStar
              width={variant === "sm" ? "20px" : ""}
              className={cn(
                "hover:tw-cursor-pointer",
                idx + 1 <= rating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300"
              )}
              onClick={() => {
                if (!setRating) return;
                setRating(idx + 1);
              }}
            />
          </div>
          {!readonly ? (
            <Typography
              element="caption"
              weight="regular"
              className="tw-inline-block tw-text-natural-950 tw-text-center"
            >
              {intl(ratingMap[idx])}
            </Typography>
          ) : null}
        </div>
      ))}
    </div>
  );
};
