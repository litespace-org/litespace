import { IUser } from "@litespace/types";

export type ITutorSettingsForm = {
  name: string;
  bio: string;
  about: string;
  email: string;
  phone: string;
  city: IUser.City;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
};
