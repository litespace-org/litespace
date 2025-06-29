import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Calendar from "@litespace/assets/Calendar";
import dayjs from "@/lib/dayjs";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Element, IInterview } from "@litespace/types";

const Card: React.FC<{
  actions: React.ReactNode;
  start: string;
  end: string;
  interviewer: Element<IInterview.FindApiResponse["list"]>["interviewer"];
  title: string;
  result: string;
  resultColor: "warning" | "brand" | "natural";
}> = ({ actions, title, interviewer, start, end, result, resultColor }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "border border-natural-100 rounded-lg w-full max-w-[490px] p-4",
        "flex flex-col gap-4"
      )}
    >
      <div className="flex flex-col gap-1">
        <Typography
          tag="h2"
          className="text-subtitle-2 font-bold text-natural-950"
        >
          {title}
        </Typography>
        <div className="flex gap-2 items-center">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <AvatarV2
              src={interviewer.image}
              alt={interviewer.name}
              id={interviewer.id}
            />
          </div>
          <Typography tag="p" className="text-tiny text-natural-700">
            {intl("tutor-onboarding.step.interview.with", {
              tutor: interviewer.name,
            })}
          </Typography>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className="w-[38px] h-[38px] p-[7px] bg-natural-800 rounded-full">
          <Calendar className="w-6 h-6 [&_*]:stroke-natural-50" />
        </div>
        <div>
          <Typography tag="h5" className="text-natural-600 text-tiny">
            {intl("labels.date-and-time")}
          </Typography>
          <div className="flex gap-3 items-center">
            <Typography
              tag="p"
              className="text-natural-950 text-tiny font-semibold"
            >
              {dayjs(start).format("dddd, DD MMMM, YYYY")}
            </Typography>
            <div className="w-1 h-1 bg-brand-700 rounded-full" />
            <Typography
              tag="p"
              className="text-natural-950 text-tiny font-semibold"
            >
              {dayjs(start).format("hh:mm A")} - {dayjs(end).format("hh:mm A")}
            </Typography>
          </div>
        </div>
      </div>
      <Typography
        tag="h2"
        className={cn("text-tiny font-medium", {
          "text-warning-700": resultColor === "warning",
          "text-brand-700": resultColor === "brand",
          "text-natural-700": resultColor === "natural",
        })}
      >
        {result}
      </Typography>
      {actions}
    </div>
  );
};

export default Card;
