import React, { useMemo } from "react";
import { Card } from "@/components/Card";
import { IUser, Void } from "@litespace/types";
import cn from "classnames";

const Option: React.FC<{
  image: string;
  active: boolean;
  select: Void;
  disabled?: boolean;
}> = ({ image, select, active, disabled }) => {
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
          active && "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900"
        )}
      >
        <img src={image} />
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
    <div className="flex flex-row gap-4">
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
