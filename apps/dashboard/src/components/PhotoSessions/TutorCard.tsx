import React from "react";
import { ArrowLeft } from "react-feather";
import { useNavigate } from "react-router-dom";
import dayjs from "@/lib/dayjs";

import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { AvatarV2 } from "@litespace/ui/Avatar";

import { Dashboard } from "@litespace/utils/routes";
import { router } from "@/lib/route";

type Props = {
  id: number;
  studioId: number | null;
  image: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
};

const TutorCard: React.FC<Props> = ({ image, name, email, createdAt, id }) => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-col p-4 gap-1 bg-natural-50 border border-natural-200 rounded">
      <div key={image} className="w-10 h-10 rounded-full overflow-hidden">
        <AvatarV2 src={image} alt={name || email} id={id} />
      </div>

      <Typography tag="h2" className="text-body font-bold">
        {name || "-"}
      </Typography>

      <Typography tag="span" className="text-tiny font-normal">
        {email}
      </Typography>

      <div className="flex flex-row justify-between items-center">
        <Typography tag="span" className="text-tiny font-normal">
          {intl("dashboard.photo-sessions.tutor-card.registration-date", {
            date: dayjs(createdAt).format("DD MMMM YYYY"),
          })}
        </Typography>

        <Button
          type="natural"
          variant="primary"
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() =>
            navigate(
              router.dashboard({ route: Dashboard.PhotoSession, tutorId: id })
            )
          }
        />
      </div>
    </div>
  );
};

export default TutorCard;
