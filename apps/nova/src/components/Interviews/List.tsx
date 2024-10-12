import { Timeline, TimelineItem } from "@litespace/luna";
import { IInterview, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { CheckCircle, Hash, HelpCircle, X } from "react-feather";
import Interview from "@/components/Interviews/Interview";
import { destructureInterviewStatus } from "@litespace/sol";

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

          const { pending, passed, rejected, canceled } =
            destructureInterviewStatus(interview.status);

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
