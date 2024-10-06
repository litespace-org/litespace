import { Timeline, TimelineItem } from "@litespace/luna";
import { IInterview, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { CheckCircle, Hash, HelpCircle, X } from "react-feather";
import Interview from "@/components/Interviews/Interview";

const List: React.FC<{
  list: IInterview.FindInterviewsApiResponse["list"];
  user: IUser.Self;
  onUpdate: () => void;
}> = ({ list, user, onUpdate }) => {
  const timeline = useMemo(
    (): TimelineItem[] =>
      list
        .map(({ members, interview, call }) => {
          const tutor = members.find((member) => member.userId !== user.id);
          if (!tutor) return null;

          const passed = interview.status === IInterview.Status.Passed;
          const pending = interview.status === IInterview.Status.Pending;
          const rejected = interview.status === IInterview.Status.Rejected;
          const canceled = interview.status === IInterview.Status.Canceled;
          return {
            id: interview.ids.self,
            children: (
              <Interview
                interview={interview}
                call={call}
                tutor={tutor}
                onUpdate={onUpdate}
              />
            ),
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
    [list, onUpdate, user.id]
  );

  return (
    <div>
      <Timeline timeline={timeline} />
    </div>
  );
};

export default List;
