import { IFilter, IMessage, IUser, Paginated } from "@/index";

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
  pinned: boolean;
  muted: boolean;
  last_seen: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Member = {
  userId: number;
  roomId: number;
  pinned: boolean;
  muted: boolean;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PopulatedMemberRow = {
  id: IUser.Row["id"];
  roomId: Row["id"];
  pinned: MemberRow["pinned"];
  muted: MemberRow["muted"];
  email: IUser.Row["email"];
  name: IUser.Row["name"];
  gender: IUser.Row["gender"];
  image: IUser.Row["image"];
  role: IUser.Row["role"];
  lastSeen: string;
  createdAt: IUser.Row["created_at"];
  updatedAt: IUser.Row["updated_at"];
};

export type PopulatedMember = {
  id: IUser.Self["id"];
  roomId: Self["id"];
  pinned: Member["pinned"];
  muted: Member["muted"];
  email: IUser.Self["email"];
  name: IUser.Self["name"];
  gender: IUser.Self["gender"];
  image: IUser.Self["image"];
  role: IUser.Self["role"];
  lastSeen: string;
  createdAt: IUser.Self["createdAt"];
  updatedAt: IUser.Self["updatedAt"];
};

export type PopulatedMemberWithStatus = PopulatedMember & { online: boolean };

export type RoomMap = Record<number, PopulatedMember[]>;

export type FindUserRoomsApiRecord = {
  roomId: number;
  settings: {
    pinned: boolean;
    muted: boolean;
  };
  unreadMessagesCount: number;
  latestMessage: IMessage.Self | null;
  otherMember: {
    id: number;
    name: string | null;
    email?: string | null;
    image: string | null;
    role: IUser.Role;
    lastSeen: string;
    online: boolean;
    gender: IUser.Gender | null;
  };
};

export type CreateRoomApiPayload = {
  userId: number;
  message?: string;
};

export type CreateRoomApiResponse = { roomId: number };

export type FindUserRoomsApiQuery = IFilter.Pagination & {
  pinned?: boolean;
  muted?: boolean;
  keyword?: string;
};

export type FindUserRoomsApiResponse = Paginated<FindUserRoomsApiRecord>;

export type FindRoomByMembersApiPayload = { members: number[] };

export type FindRoomByMembersApiResponse = { room: number };

export type FindRoomMembersApiResponse = PopulatedMemberWithStatus[];

export type FindSessionRoomApiResponse = {
  room: number;
  members: PopulatedMember[];
};

export type RoomSettings = {
  pinned?: boolean;
  muted?: boolean;
};

export type UpdateRoomPayload = RoomSettings;

export type UpdateRoomApiPayload = RoomSettings;

export type UpdateRoomApiResponse = Member;
