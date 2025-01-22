import { IUser } from "@litespace/types";

export type ITutorSettingsForm = {
  name: string;
  bio: string;
  about: string;
  email: string;
  phoneNumber: string;
  city: IUser.City;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
};
