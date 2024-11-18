import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { ITutor } from "@litespace/types";
import React from "react";
import { Link } from "react-router-dom";
import ProfileImage from "@/components/Common/ProfileImage";
import { Typography } from "@litespace/luna/Typography";
import { useFindTutorStats } from "@litespace/headless/tutor";
import TutorStatItem from "@/components/Tutors/TutorStatItem";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";

const TutorCard: React.FC<{
  tutor: ITutor.FullTutor;
}> = ({ tutor }) => {
  const intl = useFormatMessage();
  const tutorStats = useFindTutorStats(tutor.id);
  return (
    <Link
      to={`/${tutor.id}/tutor`}
      className="block border border-natural-100 shadow-ls-small p-4 rounded-lg"
    >
      <div className="flex gap-2">
        <div>
          <ProfileImage
            image={tutor.image}
            imgClassName="min-w-20 min-h-20 rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography className="text-2xl font-bold text-brand-700" tag="h3">
            {tutor.name}
          </Typography>
          <Typography className="text-xs text-natural-800">
            {tutor.bio}
          </Typography>
        </div>
      </div>
      <div className="mt-4">
        <Typography tag="p" className="line-clamp-3">
          {tutor.about}
        </Typography>
        <Link to={`/${tutor.id}/tutor`} className="underline">
          {intl("nova.tutor-card.read-more")}
        </Link>
      </div>
      <div className="flex gap-8 mt-4">
        <TutorStatItem
          title={intl("nova.tutor-card.students")}
          count={tutorStats.data?.studentCount}
        />
        <TutorStatItem
          title={intl("nova.tutor-card.lessons")}
          count={tutorStats.data?.lessonCount}
        />
        <TutorStatItem
          title={intl("nova.tutor-card.rating")}
          count={4.8}
          stars={true}
        />
      </div>
      <div className="mt-4 flex items-center  gap-3">
        <Link to={`/${tutor.id}/tutor`}>
          <Button size={ButtonSize.Large} type={ButtonType.Main}>
            {intl("nova.tutor-card.book")}
          </Button>
        </Link>
        <Link to={`/${tutor.id}/tutor`}>
          <Button
            type={ButtonType.Main}
            size={ButtonSize.Large}
            variant={ButtonVariant.Secondary}
          >
            {intl("nova.tutor-card.view")}
          </Button>
        </Link>
      </div>
    </Link>
  );
};

export default TutorCard;
