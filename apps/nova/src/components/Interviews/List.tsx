import { Timeline, TimelineItem } from "@litespace/luna/Timeline";
import { IInterview, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { CheckCircle, Hash, HelpCircle, X } from "react-feather";
import Interview from "@/components/Interviews/Interview";
import { destructureInterviewStatus } from "@litespace/sol/interview";

const List: React.FC<{
  list: IInterview.FindInterviewsApiResponse["list"];
  user: IUser.Self;
  onUpdate: () => void;
}> = ({ list, onUpdate }) => {
  const timeline = useMemo(
    () =>
      list
        .map((interview) => {
          const { pending, passed, rejected, canceled } =
            destructureInterviewStatus(interview.status);

          return {
            id: interview.ids.self,
            children: <Interview interview={interview} onUpdate={onUpdate} />,
            icon: passed ? (
              <CheckCircle />
            ) : pending ? (
              <HelpCircle />
            ) : rejected || canceled ? (
              <X />
            ) : (
              <Hash />
            ),
          };
        })
        .filter((item) => item !== null),
    [list, onUpdate]
  );

  return (
    <div>
      <Timeline timeline={timeline as TimelineItem[]} />
    </div>
  );
};

export default List;
