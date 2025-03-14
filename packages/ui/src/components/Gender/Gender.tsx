import React, { useMemo } from "react";
import { Card } from "@/components/Card";
import { IUser, Void } from "@litespace/types";
import cn from "classnames";
import StudentMaleLight from "@litespace/assets/StudentMaleLight";
import StudentMaleDark from "@litespace/assets/StudentMaleDark";
import StudentFemaleLight from "@litespace/assets/StudentFemaleLight";
import StudentFemaleDark from "@litespace/assets/StudentFemaleDark";
import TutorMaleLight from "@litespace/assets/TutorMaleLight";
import TutorMaleDark from "@litespace/assets/TutorMaleDark";
import TutorFemaleLight from "@litespace/assets/TutorFemaleLight";
import TutorFemaleDark from "@litespace/assets/TutorFemaleDark";

type Icon = React.MemoExoticComponent<
  (props: React.SVGProps<SVGSVGElement>) => JSX.Element
>;

type Image = {
  Light: Icon;
  Dark: Icon;
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
      className="focus:outline-none focus:ring focus:ring-blue-800 rounded disabled:opacity-50"
    >
      <Card
        className={cn(
          "aspect-square hover:bg-surface-300 transition-colors duration-300",
          active && "!bg-background-selection"
        )}
      >
        <Image.Light className="w-full h-full block dark:hidden" />
        <Image.Dark className="w-full h-full hidden dark:block" />
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
              Dark: StudentMaleDark,
              Light: StudentMaleLight,
            }
          : {
              Dark: TutorMaleDark,
              Light: TutorMaleLight,
            },
        gender: IUser.Gender.Male,
      },
      {
        Image: student
          ? {
              Dark: StudentFemaleDark,
              Light: StudentFemaleLight,
            }
          : {
              Dark: TutorFemaleDark,
              Light: TutorFemaleLight,
            },
        gender: IUser.Gender.Female,
      },
    ],
    [student]
  );

  return (
    <div className="flex flex-row gap-4">
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
