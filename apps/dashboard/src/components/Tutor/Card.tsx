import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { ArrowLeft } from "react-feather";
import { TutorCardProps } from "@/types/tutor";

const Card: React.FC<TutorCardProps> = ({
  image,
  name,
  email,
  registrationDate,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="relative flex flex-col p-4 gap-1 bg-natural-50 border border-natural-200 rounded min-w-[244px]">
      <img className="w-10 h-10 mb-1 rounded-full" src={image} />

      <Typography tag="h2" className="text-body font-bold">
        {name}
      </Typography>

      <Typography tag="span" className="text-tiny font-normal">
        {email}
      </Typography>

      <Typography tag="span" className="text-tiny font-normal">
        {intl.rich("dashboard.photo-sessions.tutor-card.registration-date", {
          ts: registrationDate,
        })}
      </Typography>

      <div className="absolute left-4 bottom-4">
        <Button
          variant="tertiary"
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => alert("TODO")}
        />
      </div>
    </div>
  );
};

export default Card;
