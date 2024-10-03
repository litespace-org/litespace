import React, { useMemo } from "react";
import { Card } from "@/components/Card";
import { IUser, Void } from "@litespace/types";
import cn from "classnames";
import { Tutor } from "@/icons";

const Option: React.FC<{
  image: string;
  active: boolean;
  select: Void;
  disabled?: boolean;
}> = ({ select, active, disabled }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={select}
      className="focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-800 tw-rounded disabled:tw-opacity-50"
    >
      <Card
        className={cn(
          "tw-aspect-square hover:tw-bg-surface-300 tw-transition-colors tw-duration-300",
          active && "!tw-bg-background-selection"
        )}
      >
        <Tutor.Light className="tw-w-full tw-h-full tw-block dark:tw-hidden" />
        <Tutor.Dark className="tw-w-full tw-h-full tw-hidden dark:tw-block" />
      </Card>
    </button>
  );
};

const Gender: React.FC<{
  gender?: IUser.Gender;
  disabled?: boolean;
  setGender: (gender: IUser.Gender) => void;
}> = ({ gender, disabled, setGender }) => {
  const images = useMemo(
    () => [
      { image: "/avatar-1.png", gender: IUser.Gender.Male },
      { image: "/avatar-2.png", gender: IUser.Gender.Female },
    ],
    []
  );

  return (
    <div className="tw-flex tw-flex-row tw-gap-4">
      {images.map(({ image, gender: option }) => (
        <Option
          key={image}
          image={image}
          disabled={disabled}
          active={gender === option}
          select={() => setGender(option)}
        />
      ))}
    </div>
  );
};

export default Gender;
