import React from "react";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";
import { motion } from "framer-motion";

export const Loader: React.FC<{
  text?: string;
  variant?: "small" | "medium" | "large";
}> = ({ text, variant = "large" }) => {
  return (
    <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4">
      <motion.div
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
        style={{
          maskImage: `radial-gradient(circle, transparent 
          ${variant === "large" ? "30px" : ""}
				  ${variant === "medium" ? "25px" : ""}
				  ${variant === "small" ? "15px" : ""}, white
				  ${variant === "large" ? "16px" : ""}
				  ${variant === "medium" ? "0px" : ""}
          ${variant === "small" ? "0px" : ""}
				  )`,
        }}
        className={cn(
          "tw-flex tw-items-center tw-relative tw-rounded-full tw-justify-center tw-bg-loader",
          {
            "tw-w-[40px] tw-h-[40px] _tw-max-w-16 _tw-max-h-16":
              variant === "small",
            "tw-w-16 tw-h-16 tw-max-w-16 tw-max-h-16": variant === "medium",
            "tw-w-20 tw-h-20 tw-max-w-20 tw-max-h-20": variant === "large",
          }
        )}
      >
        <div
          className={cn(
            "tw-bg-background-loader-spinner tw-rounded-full tw-absolute tw-bottom-0 tw-left-1/2 -tw-translate-x-1/2",
            {
              "tw-w-[7px] tw-h-[5px]": variant === "small",
              "tw-w-[10px] tw-h-[7px]": variant === "medium",
              "tw-w-[13px] tw-h-[10px]": variant === "large",
            }
          )}
        />
      </motion.div>
      {text ? (
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950 tw-text-center"
        >
          {text}
        </Typography>
      ) : null}
    </div>
  );
};
