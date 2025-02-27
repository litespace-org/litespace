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
        "flex justify-around p-0",
        { "gap-2 md:gap-1 lg:gap-2": variant === "sm" },
        { "gap-1": variant === "md" },
        { "gap-8": variant === "lg" || variant === "xl" }
      )}
    >
      {range(5).map((idx) => (
        <div key={idx} className={cn("flex flex-col gap-2  md:gap-4")}>
          <motion.button
            whileHover={readonly ? undefined : { scale: 1.1 }}
            whileTap={readonly ? undefined : { scale: 0.9 }}
            className={cn(
              {
                "w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5": variant === "sm",
              },
              { "w-[38px] h-[38px]": variant === "md" },
              { "w-[48px] h-[48px]": variant === "lg" },
              { "w-[80px] h-[80px]": variant === "xl" }
            )}
            onClick={() => {
              if (!setRating || readonly) return;
              setRating(idx + 1);
            }}
          >
            <SStar
              className={cn(
                variant === "sm" && "w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5",
                !readonly && "hover:cursor-pointer",
                idx + 1 <= rating
                  ? "[&>*]:fill-warning-500"
                  : "[&>*]:fill-natural-300"
              )}
            />
          </motion.button>
          {!readonly ? (
            <Typography
              tag="span"
              className="inline-block text-natural-950 text-center text-tiny sm:text-caption font-normal"
            >
              {intl(ratingMap[idx])}
            </Typography>
          ) : null}
        </div>
      ))}
    </div>
  );
};
