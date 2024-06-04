import * as User from "@/user";

export type Self = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  zoomRefreshToken: string | null;
  aquiredRefreshTokenAt: string | null;
  authorizedZoomApp: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FullTutor = User.Self & {
  bio: string | null;
  about: string | null;
  video: string | null;
  zoomRefreshToken: string | null;
  aquiredRefreshTokenAt: string | null;
  authorizedZoomApp: boolean;
};

export type Row = {
  id: number;
  bio: string | null;
  about: string | null;
  video: string | null;
  authorized_zoom_app: boolean;
  zoom_refresh_token: boolean;
  aquired_refresh_token_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Shareable = Omit<Self, "zoomRefreshToken">;
