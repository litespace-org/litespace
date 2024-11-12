export enum Route {
  Root = "/",
  Invoices = "/invoices",
  Media = "/media",
  Login = "/login",
  Plans = "/plans",
  Users = "/users",
  User = "/user/:id",
  Interviews = "/interviews",
  Lessons = "/lessons",
  ServerStats = "/server-stats",
  PlatformSettings = "/platform-settings",
  Topics = "/topics",
  VerifyEmail = "/verify-email",
  UserSetting = "/user-settings",
}

export const CALLBACK_URL = window.location.origin.concat(Route.VerifyEmail);
