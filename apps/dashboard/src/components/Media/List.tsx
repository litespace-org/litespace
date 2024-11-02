import { Timeline, TimelineItem } from "@litespace/luna/components/Timeline";
import { ITutor } from "@litespace/types";
import React, { useMemo } from "react";
import { Hash } from "react-feather";
import Tutor from "@/components/Media/Tutor";

const List: React.FC<{
  list: ITutor.PublicTutorFieldsForMediaProvider[];
  refersh: () => void;
}> = ({ list, refersh }) => {
  const timeline = useMemo((): TimelineItem[] => {
    return list.map((tutor) => ({
      id: tutor.id,
      children: <Tutor tutor={tutor} refresh={refersh} />,
      icon: <Hash />,
    }));
  }, [list, refersh]);
  return <Timeline timeline={timeline} />;
};

export default List;
