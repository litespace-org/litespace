import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { ArrowLeft } from "react-feather";
import { Avatar } from "@litespace/ui/Avatar";
import dayjs from "@/lib/dayjs";

type Props = {
  id: number;
  image: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
};

const TutorCard: React.FC<Props> = ({ image, name, email, createdAt, id }) => {
  const intl = useFormatMessage();
  return (
    <div className="relative flex flex-col p-4 gap-1 bg-natural-50 border border-natural-200 rounded">
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <Avatar src={image} alt={name || email} seed={id.toString()} />
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
          variant="tertiary"
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => alert("TODO")}
        />
      </div>
    </div>
  );
};

export default TutorCard;
