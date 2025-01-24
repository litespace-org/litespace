import ArrowRight from "@litespace/assets/ArrowRight";
import ArrowLeft from "@litespace/assets/ArrowLeft";
import React, { useMemo } from "react";
import { Dayjs } from "dayjs";
import { Void } from "@litespace/types";
import { Typography } from "@litespace/luna/Typography";
import Calendar from "@litespace/assets/Calendar";
import Categories from "@litespace/assets/Categories";
import cn from "classnames";
import { motion } from "framer-motion";

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
        element="subtitle-2"
        weight="bold"
        className="text-natural-950 mb-2"
      >
        {date.format("YYYY MMMM")}
      </Typography>
      <div className="flex flex-row justify-between items-center">
        <Typography
          element="body"
          weight="semibold"
          className="text-natural-700"
        >
          {date.startOf("week").format("DD MMMM YYYY")}&nbsp;-&nbsp;
          {date.endOf("week").format("DD MMMM YYYY")}
        </Typography>

        <div className="flex flex-row gap-6 items-center justify-center">
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
                    "transition-colors duration-300",
                    view === viewOption
                      ? "[&>*]:stroke-brand-700"
                      : "[&>*]:stroke-natural-600"
                  )}
                />
              </motion.button>
            ))}
          </div>
          <div className="flex tw-flex-row gap-4 items-center justify-center">
            <button onClick={prevWeek} type="button">
              <ArrowRight className="[&>*]:stroke-brand-700" />
            </button>
            <Typography
              element="body"
              weight="bold"
              className="text-natural-950"
            >
              {date.startOf("week").format("DD MMMM")}&nbsp;-&nbsp;
              {date.endOf("week").format("DD MMMM")}
            </Typography>
            <button onClick={nextWeek} type="button">
              <ArrowLeft className="[&>*]:stroke-brand-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
