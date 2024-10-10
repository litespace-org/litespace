import React, { useMemo } from "react";
import { Card } from "@/components/Card";
import { IUser, Void } from "@litespace/types";
import cn from "classnames";
import Icons, { SVG } from "@/icons";

type Image = {
  Light: SVG;
  Dark: SVG;
};

const Option: React.FC<{
  Image: Image;
  active: boolean;
  select: Void;
  disabled?: boolean;
}> = ({ select, Image, active, disabled }) => {
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
        <Image.Light className="tw-w-full tw-h-full tw-block dark:tw-hidden" />
        <Image.Dark className="tw-w-full tw-h-full tw-hidden dark:tw-block" />
      </Card>
    </button>
  );
};

const Gender: React.FC<{
  gender?: IUser.Gender;
  disabled?: boolean;
  setGender: (gender: IUser.Gender) => void;
  student: boolean;
}> = ({ gender, disabled, student, setGender }) => {
  const images = useMemo(
    () => [
      {
        Image: student
          ? {
              Dark: Icons.StudentMaleDark,
              Light: Icons.StudentMaleLight,
            }
          : {
              Dark: Icons.TutorMaleDark,
              Light: Icons.TutorMaleLight,
            },
        gender: IUser.Gender.Male,
      },
      {
        Image: student
          ? {
              Dark: Icons.StudentFemaleDark,
              Light: Icons.StudentFemaleLight,
            }
          : {
              Dark: Icons.TutorFemaleDark,
              Light: Icons.TutorFemaleLight,
            },
        gender: IUser.Gender.Female,
      },
    ],
    [student]
  );

  return (
    <div className="tw-flex tw-flex-row tw-gap-4">
      {images.map(({ Image, gender: option }) => (
        <Option
          key={option}
          Image={Image}
          disabled={disabled}
          active={gender === option}
          select={() => setGender(option)}
        />
      ))}
    </div>
  );
};

export default Gender;
