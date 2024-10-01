import { backend } from "@/lib/atlas";
import { asAssetUrl } from "@litespace/atlas";
import { Button, ButtonSize, messages } from "@litespace/luna";
import { ITutor } from "@litespace/types";
import cn from "classnames";
import React from "react";
import { useIntl } from "react-intl";

const TutorCard: React.FC<{
  tutor: ITutor.FullTutor;
  select: () => void;
}> = ({ tutor, select }) => {
  const intl = useIntl();

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
          className="w-full h-full object-cover"
          src={asAssetUrl(backend, tutor.image!)}
          alt={tutor.name!}
        />
      </div>

      <div className="flex flex-row justify-between items-center p-4">
        <div className="">
          <h6 className="text-foreground mb-1">{tutor.name}</h6>
          <p className="text-sm text-foreground-light">{tutor.bio}</p>
        </div>

        <div>
          <Button onClick={select} size={ButtonSize.Small}>
            {intl.formatMessage({ id: messages["global.book.lesson.label"] })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
