export enum ErrorCode {
  Unauthorized,
  BadRequest,
  RoomExists,
  UserExists,
  UserAlreadyTyped,
  TutorHasNoTime,
  Unexpected,
  NotFound,
  UserNotFound,
  SlotNotFound,
  CallNoteFound,
  TutorNotFound,
  LessonNotFound,
  ratingNotFound,
  CouponNotFound,
  AssetNotFound,
  InviteNotFound,
  PlanNotFound,
  ReportNotFound,
  ReportReplyNotFound,
  subscriptionNotFound,
  AlreadyRated,
  AlreadySubscribed,
}

type CodedError = {
  message: string;
  code: ErrorCode;
};

export const errors = {
  fobidden: { message: "Unauthorized access", code: ErrorCode.Unauthorized },
  badRequest: { message: "Bad Request", code: ErrorCode.BadRequest },
  roomExists: { message: "Room already exist", code: ErrorCode.RoomExists },
  userExists: { message: "User already exist", code: ErrorCode.UserExists },
  userAlreadyTyped: {
    message: "User already typed",
    code: ErrorCode.UserAlreadyTyped,
  },
  tutorHasNotTime: {
    message: "Tutor doesn't have the time for this lesson",
    code: ErrorCode.TutorHasNoTime,
  },
  unexpected: {
    message: "Unexpected error occurred, please retry",
    code: ErrorCode.Unexpected,
  },
  notfound: {
    base: { message: "Not found", code: ErrorCode.NotFound },
    user: { message: "User not found", code: ErrorCode.UserNotFound },
    slot: { message: "Slot not found", code: ErrorCode.SlotNotFound },
    call: { message: "Call not found", code: ErrorCode.CallNoteFound },
    tutor: { message: "Tutor not found", code: ErrorCode.TutorNotFound },
    lesson: { message: "Lesson not found", code: ErrorCode.LessonNotFound },
    rating: { message: "Rating not found", code: ErrorCode.ratingNotFound },
    asset: { message: "Asset not found", code: ErrorCode.AssetNotFound },
    subscription: {
      message: "Subscription not found",
      code: ErrorCode.subscriptionNotFound,
    },
  },
  alreadyRated: {
    message: "User already rated",
    code: ErrorCode.AlreadyRated,
  },
  alreadySubscribed: {
    message: "Student already subscribed",
    code: ErrorCode.AlreadySubscribed,
  },
} as const;

export default class ResponseError extends Error {
  statusCode: number;
  errorCode: ErrorCode;

  constructor(error: CodedError, statusCode: number) {
    super(error.message);
    this.statusCode = statusCode;
    this.errorCode = error.code;
  }
}

export const forbidden = () => new ResponseError(errors.fobidden, 401);
export const badRequest = () => new ResponseError(errors.badRequest, 400);
export const roomExists = () => new ResponseError(errors.roomExists, 400);
export const userExists = () => new ResponseError(errors.userExists, 400);
export const userAlreadyTyped = () =>
  new ResponseError(errors.userAlreadyTyped, 400);
export const tutorHasNoTime = () =>
  new ResponseError(errors.tutorHasNotTime, 400);
export const alreadyRated = () => new ResponseError(errors.alreadyRated, 400);
export const alreadySubscribed = () =>
  new ResponseError(errors.alreadySubscribed, 400);

export const unexpected = () => new ResponseError(errors.unexpected, 500);

export const notfound = {
  base: () => new ResponseError(errors.notfound.base, 404),
  user: () => new ResponseError(errors.notfound.user, 404),
  slot: () => new ResponseError(errors.notfound.slot, 404),
  tutor: () => new ResponseError(errors.notfound.tutor, 404),
  call: () => new ResponseError(errors.notfound.call, 404),
  rating: () => new ResponseError(errors.notfound.rating, 404),
  subscription: () => new ResponseError(errors.notfound.subscription, 404),
  asset: () => new ResponseError(errors.notfound.asset, 400),
  coupon: () =>
    new ResponseError(
      {
        message: "Coupon not found",
        code: ErrorCode.CouponNotFound,
      },
      400
    ),
  invite: () =>
    new ResponseError(
      {
        message: "Invite not found",
        code: ErrorCode.InviteNotFound,
      },
      400
    ),
  plan: () =>
    new ResponseError(
      {
        message: "Plan not found",
        code: ErrorCode.PlanNotFound,
      },
      400
    ),
  report: () =>
    new ResponseError(
      {
        message: "Report not found",
        code: ErrorCode.ReportNotFound,
      },
      400
    ),
  reportReply: () =>
    new ResponseError(
      {
        message: "Report reply not found",
        code: ErrorCode.ReportReplyNotFound,
      },
      400
    ),
} as const;
