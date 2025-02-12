import ArrowLeft from "@litespace/assets/ArrowLeft";
import ArrowRight from "@litespace/assets/ArrowRight";
import Calendar from "@litespace/assets/Calendar";
import Categories from "@litespace/assets/Categories";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import React, { useMemo } from "react";

export type View = "calendar" | "list";

interface Props {
  date: Dayjs;
  nextWeek: Void;
  prevWeek: Void;
  view: View;
  setView: (view: View) => void;
}

const Header: React.FC<Props> = ({
  date,
  nextWeek,
  prevWeek,
  view,
  setView,
}) => {
  const { lg } = useMediaQuery();
  const views = useMemo(() => {
    return [
      {
        Icon: Categories,
        view: "list",
      },
      {
        Icon: Calendar,
        view: "calendar",
      },
    ] as const;
  }, []);

  return (
    <div>
      <Typography
        element={{ default: "body", lg: "subtitle-2" }}
        weight="bold"
        className="text-natural-950 mb-2"
      >
        {date.format("MMMM YYYY")}
      </Typography>
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start md:items-center">
        <Typography
          element={{ default: "caption", lg: "body" }}
          weight="semibold"
          className="text-natural-700"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>

        <div className="w-full sm:w-fit flex flex-row gap-6 items-center justify-center">
          {lg ? (
            <div className="flex flex-row items-center justify-center gap-4">
              {views.map(({ view: viewOption, Icon }) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  key={viewOption}
                  onClick={() => setView(viewOption)}
                >
                  <Icon
                    className={cn(
                      "tw-w-6 tw-h-6 transition-colors duration-300",
                      view === viewOption
                        ? "[&>*]:stroke-brand-700"
                        : "[&>*]:stroke-natural-600"
                    )}
                  />
                </motion.button>
              ))}
            </div>
          ) : null}
          <div className="w-full flex flex-row sm:gap-4 items-center justify-between sm:justify-center">
            <button onClick={prevWeek} type="button">
              <ArrowRight
                width={24}
                height={24}
                className="[&>*]:stroke-brand-700"
              />
            </button>
            <Typography
              element={{ default: "caption", lg: "body" }}
              weight="bold"
              className="text-natural-950"
            >
              {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
              {date.endOf("week").format("DD MMMM")}
            </Typography>
            <button onClick={nextWeek} type="button">
              <ArrowLeft
                width={24}
                height={24}
                className="[&>*]:stroke-brand-700"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
