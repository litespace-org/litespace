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
  created_at: Date;
  updated_at: Date;
};

export type Member = {
  userId: number;
  roomId: number;
  pinned: boolean;
  muted: boolean;
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
  image: IUser.Row["image"];
  role: IUser.Row["role"];
  online: IUser.Row["online"];
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
  image: IUser.Self["image"];
  role: IUser.Self["role"];
  online: IUser.Self["online"];
  createdAt: IUser.Self["createdAt"];
  updatedAt: IUser.Self["updatedAt"];
};

export type RoomMap = Record<number, PopulatedMember[]>;

export type FindUserRoomsApiQuery = IFilter.Pagination & {
  pinned?: boolean;
  muted?: boolean;
  keyword?: string;
};

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
    image: string | null;
    online: boolean;
    role: IUser.Role;
    lastSeen: string;
  };
};

export type CreateRoomApiResponse = { roomId: number };

export type FindUserRoomsApiResponse = Paginated<FindUserRoomsApiRecord>;

export type FindRoomByMembersApiResponse = { room: number };

export type FindRoomMembersApiResponse = PopulatedMember[];

export type FindCallRoomApiResponse = {
  room: number;
  members: PopulatedMember[];
};

export type RoomSettings = {
  pinned?: boolean;
  muted?: boolean;
};

export type UpdateRoomPayload = RoomSettings;

export type UpdateRoomApiPayload = RoomSettings;
