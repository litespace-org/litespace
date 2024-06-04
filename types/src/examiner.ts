import * as User from "@/user";

export type FullExaminer = User.Self & {
  zoomRefreshToken: string | null;
  aquiredRefreshTokenAt: string | null;
  authorizedZoomApp: boolean;
};

export type Self = {
  id: number;
  zoomRefreshToken: string | null;
  aquiredRefreshTokenAt: string | null;
  authorizedZoomApp: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: number;
  zoom_refresh_token: string | null;
  aquired_refresh_token_at: Date | null;
  authorized_zoom_app: boolean;
  created_at: Date;
  updated_at: Date;
};
