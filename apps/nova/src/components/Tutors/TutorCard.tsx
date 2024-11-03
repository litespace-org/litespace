import { Route } from "@/types/routes";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { ITutor } from "@litespace/types";
import cn from "classnames";
import React from "react";
import { Link } from "react-router-dom";

const TutorCard: React.FC<{
  tutor: ITutor.FullTutor;
  select: () => void;
}> = ({ tutor, select }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden shadow-2xl bg-surface-100",
        "border border-border hover:border-border-stronger",
        "transition-colors duration-300"
      )}
    >
      <div className="h-[300px] md:h-[400px]">
        <img
          className="object-cover w-full h-full"
          src={tutor.image ? asFullAssetUrl(tutor.image) : "/avatar-1.png"}
          alt={tutor.name!}
        />
      </div>

      <div className="flex flex-row items-center justify-between p-4">
        <div className="w-3/4">
          <Link
            to={Route.TutorProfile.replace(":id", tutor.id.toString())}
            className="underline text-brand-link"
          >
            <h6 className="mb-1">{tutor.name}</h6>
          </Link>
          <p className="text-sm truncate text-foreground-light">{tutor.bio}</p>
        </div>

        <div>
          <Button onClick={select} size={ButtonSize.Small}>
            {intl("global.book.lesson.label")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
