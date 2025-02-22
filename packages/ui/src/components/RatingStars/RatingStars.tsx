import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales";
import SStar from "@litespace/assets/SStar";
import cn from "classnames";
import { range } from "lodash";
import React from "react";
import { motion } from "framer-motion";

type StarProps = {
  /**
   * Rating is number bet 1 to 5 default is zero
   */
  rating: number;
  /**
   * Represents the size of star
   */
  variant?: "sm" | "md" | "lg" | "xl";
  /**
   * State shows weather stars can be clicked or not
   */
  readonly: boolean;
  setRating?: (newRating: number) => void;
  className?: string;
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
        "tw-flex tw-justify-around tw-p-0",
        { "tw-gap-2": variant === "sm" },
        { "tw-gap-1": variant === "md" },
        { "tw-gap-8": variant === "lg" || variant === "xl" }
      )}
    >
      {range(5).map((idx) => (
        <div
          key={idx}
          className={cn("tw-flex tw-flex-col tw-gap-2 sm:tw-gap-4")}
        >
          <motion.button
            whileHover={readonly ? undefined : { scale: 1.1 }}
            whileTap={readonly ? undefined : { scale: 0.9 }}
            className={cn(
              { "tw-w-5 tw-h-5": variant === "sm" },
              { "tw-w-[38px] tw-h-[38px]": variant === "md" },
              { "tw-w-[48px] tw-h-[48px]": variant === "lg" },
              { "tw-w-[80px] tw-h-[80px]": variant === "xl" }
            )}
            onClick={() => {
              if (!setRating || readonly) return;
              setRating(idx + 1);
            }}
          >
            <SStar
              className={cn(
                variant === "sm" && "tw-w-[20px]",
                !readonly && "hover:tw-cursor-pointer",
                idx + 1 <= rating
                  ? "[&>*]:tw-fill-warning-500"
                  : "[&>*]:tw-fill-natural-300"
              )}
            />
          </motion.button>
          {!readonly ? (
            <Typography
              tag="span"
              className="tw-inline-block tw-text-natural-950 tw-text-center tw-text-tiny sm:tw-text-caption tw-font-normal"
            >
              {intl(ratingMap[idx])}
            </Typography>
          ) : null}
        </div>
      ))}
    </div>
  );
};
