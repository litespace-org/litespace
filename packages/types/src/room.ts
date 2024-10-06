import { IUser, Paginated } from ".";

export type Self = {
  id: number;
  createdAt: string;
};

export type Row = {
  id: number;
  created_at: Date;
};

export type MemberRow = {
  user_id: number;
  room_id: number;
};

export type Member = {
  userId: number;
  roomId: number;
};

export type PopulatedMemberRow = {
  id: IUser.Row["id"];
  roomId: Row["id"];
  email: IUser.Row["email"];
  name: IUser.Row["name"];
  image: IUser.Row["image"];
  role: IUser.Row["role"];
  online: IUser.Row["online"];
  createdAt: IUser.Row["created_at"];
  updatedAt: IUser.Row["updated_at"];
};

export type PopulatedMember = {
  id: IUser.Self["id"];
  roomId: Self["id"];
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Self["role"];
  online: IUser.Self["online"];
  createdAt: IUser.Self["createdAt"];
  updatedAt: IUser.Self["updatedAt"];
};

export type RoomMap = Record<number, PopulatedMember[]>;

export type FindUserRoomsApiResponse = Paginated<PopulatedMember[]>;

export type FindRoomByMembersApiResponse = { room: number };

export type FindRoomMembersApiResponse = PopulatedMember[];

export type FindCallRoomApiResponse = {
  room: number;
  members: PopulatedMember[];
};
