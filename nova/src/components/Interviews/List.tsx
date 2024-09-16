import { Timeline, TimelineItem } from "@litespace/luna";
import { IInterview, IUser } from "@litespace/types";
import React, { useMemo } from "react";
import { Hash } from "react-feather";
import Interview from "@/components/Interviews/Interview";

const List: React.FC<{
  list: IInterview.FindInterviewsApiResponse["list"];
  user: IUser.Self;
}> = ({ list, user }) => {
  const timeline = useMemo(
    (): TimelineItem[] =>
      list
        .map(({ members, interview, call }) => {
          const tutor = members.find((member) => member.userId !== user.id);
          if (!tutor) return null;
          return {
            id: interview.ids.self,
            children: (
              <Interview interview={interview} call={call} tutor={tutor} />
            ),
            icon: <Hash />,
          };
        })
        .filter((item) => item !== null),
    [list, user.id]
  );

  return (
    <div>
      <Timeline timeline={timeline} />
    </div>
  );
};

export default List;
