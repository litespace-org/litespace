import { useFindTutorRatings } from "@litespace/headless/rating";
import { Dialog } from "@litespace/ui/Dialog";
import { RateLesson } from "@litespace/ui/Lessons";
import React, { useState } from "react";

const PostSessionDialogs: React.FC<{
  postSession: boolean;
  tutorName: string | null;
  tutorId: number;
}> = ({ postSession, tutorName }) => {
  const [isRated, setIsRated] = useState(false);

  const rate = useFindTutorRatings();

  if (!postSession) return;
  return (
    <div>
      <Dialog open={!isRated}>
        <RateLesson
          close={() => {}}
          onRate={() => setIsRated(true)}
          rateLoading={false}
          tutorName={tutorName}
          type="session"
        />
      </Dialog>
      <Dialog open={isRated}>reschedule with the same tutor next week</Dialog>
    </div>
  );
};

export default PostSessionDialogs;
