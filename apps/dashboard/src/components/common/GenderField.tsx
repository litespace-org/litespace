import { useDashFormatMessage } from "@/hooks/intl";
import { IUser } from "@litespace/types";
import React from "react";

const GenderField: React.FC<{ gender?: IUser.Gender | null }> = ({
  gender,
}) => {
  const intl = useDashFormatMessage();
  return (
    <React.Fragment>
      {gender === IUser.Gender.Male
        ? intl("global.gender.male")
        : gender === IUser.Gender.Female
          ? intl("global.gender.female")
          : "-"}
    </React.Fragment>
  );
};

export default GenderField;
