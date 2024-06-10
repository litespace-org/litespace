export enum ErrorCode {
  Unauthorized = "unauthorizedAccess",
  BadRequest = "badReqest",
  RoomExists = "roomExists",
  UserExists = "userExists",
  UserAlreadyTyped = "userAlreadyType",
  TutorHasNoTime = "tutorHasNoTime",
  Unexpected = "unexpected",
  UserNotFound = "userNotFound",
  SlotNotFound = "slotNotFound",
  TutorNotFound = "tutorNotFound",
  LessonNotFound = "lessonNotFound",
  ratingNotFound = "ratingNotFound",
  subscriptionNotFound = "subscriptionNotFound",
  AlreadyRated = "alreadyRated",
  AlreadySubscribed = "alreadySubscribed",
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
  userNotFound: {
    message: "User not found",
    code: ErrorCode.UserNotFound,
  },
  slotNotFound: {
    message: "Slot not found",
    code: ErrorCode.SlotNotFound,
  },
  tutorNotFound: {
    message: "Tutor not found",
    code: ErrorCode.TutorNotFound,
  },
  lessonNotFound: {
    message: "Lesson not found",
    code: ErrorCode.LessonNotFound,
  },
  ratingNotFound: {
    message: "Rating not found",
    code: ErrorCode.ratingNotFound,
  },
  subscriptionNotFound: {
    message: "Subscription not found",
    code: ErrorCode.subscriptionNotFound,
  },
  alreadyRated: {
    message: "Student already rated this tutor",
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
export const userNotFound = () => new ResponseError(errors.userNotFound, 404);
export const slotNotFound = () => new ResponseError(errors.slotNotFound, 404);
export const tutorNotFound = () => new ResponseError(errors.tutorNotFound, 404);
export const callNotFound = () => new ResponseError(errors.lessonNotFound, 404);
export const ratingNotFound = () =>
  new ResponseError(errors.ratingNotFound, 404);
export const alreadyRated = () => new ResponseError(errors.alreadyRated, 400);
export const alreadySubscribed = () =>
  new ResponseError(errors.alreadySubscribed, 400);
export const subscriptionNotFound = () =>
  new ResponseError(errors.subscriptionNotFound, 404);
