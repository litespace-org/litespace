export enum Type {
  SuperAdmin = "super_admin",
  RegularAdmin = "reg_admin",
  Tutor = "tutor",
  Student = "student",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export type Self = {
  id: number;
  email: string;
  hasPassword: boolean;
  name: string | null;
  avatar: string | null;
  birthday: string | null;
  gender: Gender | null;
  type: Type;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Credentials = {
  email: string;
  password: string;
};
