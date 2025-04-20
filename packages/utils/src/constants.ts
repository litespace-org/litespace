import { IConfirmationCode, IKafka, IUser } from "@litespace/types";

export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const MINUTES_IN_DAY = 60 * 24;
export const MINUTES_IN_WEEK = 60 * 24 * 7;
export const MIN_AGE = 10;
export const MAX_AGE = 70;
export const MIN_USER_NAME_LENGTH = 2;
export const MAX_USER_NAME_LENGTH = 30;
export const MIN_INTERVIEW_LEVEL = 1;
export const MAX_INTERVIEW_LEVEL = 5;
export const MAX_RATING_TEXT_LENGTH = 1000;
export const MIN_RATING_TEXT_LENGTH = 3;
export const MAX_PLAN_ALIAS_LENGTH = 255;
export const MIN_PLAN_ALIAS_LENGTH = 3;
export const MIN_RATING_VALUE = 1;
export const MAX_RATING_VALUE = 5;
export const MIN_DISCOUNT_VALUE = 0;
export const MAX_DISCOUNT_VALUE = 100;
export const MAX_TUTOR_BIO_TEXT_LENGTH = 60;
export const BIO_REGEX = /[\u0600-\u06ff\s]{5,}/;
export const MIN_BIO_LEGNTH = 5;
export const MAX_TUTOR_ABOUT_TEXT_LENGTH = 1000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 100;
export const MAX_USER_AGE = 60;
export const MIN_USER_AGE = 10;
export const MIN_TUTOR_NOTICE_DURATION = 0;
export const MAX_TUTOR_NOTICE_DURATION = 24 * 60;
export const MAX_FEEDBACK_TEXT_LENGTH = 1000;
export const MIN_FEEDBACK_TEXT_LENGTH = 5;
export const MAX_NOTE_TEXT_LENGTH = 1000;
export const MIN_NOTE_TEXT_LENGTH = 5;
export const MIN_PLAN_WEEKLY_MINUTES = 0;
export const MAX_PLAN_DISCOUNT = 100;
export const MIN_PLAN_DISCOUNT = 0;
export const MAX_MESSAGE_TEXT_LENGTH = 1000;
export const MIN_MESSAGE_TEXT_LENGTH = 1;
export const MAX_PLAN_WEEKLY_MINUTES = MINUTES_IN_WEEK;
export const NUMBERS_ONLY_REGEX = /\d/;
export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*\W)(?!.* ).{8,50}$/;
export const PASSWORD_LETTERS_REGEX = /[\W\w][^\d]+/;
export const HTML_TAGS_REGEX = /<[^>]*>/g;
export const HTML_REGEX = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
export const COUPON_REGEX = /[a-zA-Z0-9!@#$%^&*()_+=-}{?.,]/;
export const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const ARABIC_LETTERS_REGEX = /^[\u0600-\u06ff\s\d.]+$/;
export const PHONE_NUMBER_REGEX = /^01[0125]\d{8}$/;
export const INSTAPAY_REGEX = /\w+@instapay/;
export const ARABIC_LETTERS_ONLY_REGEX = /^[\u0600-\u06ff\s]+$/;
export const TOPIC_ARABIC_NAME_REGEX = /[\u0600-\u06ff\s]{3,50}/;
export const TOPIC_ENGLISH_NAME_REGEX = /[a-zA-Z\s]{3,50}/;
export const MIN_TOPIC_LEGNTH = 3;
export const MAX_TOPIC_LEGNTH = 50;
export const MAX_TOPICS_COUNT = 30;
export const MIN_CONTACT_REQUEST_TITLE_LENGTH = 5;
export const MAX_CONTACT_REQUEST_TITLE_LENGTH = 128;
export const MIN_CONTACT_REQUEST_MESSAGE_LENGTH = 10;
export const MAX_CONTACT_REQUEST_MESSAGE_LENGTH = 1000;

// All users except tutors and tutor-managers can have their names in either Arabic or English or both.
// https://regex101.com/r/ER7McY/1
export const USER_NAME_REGEX = /^[A-Za-z\u0600-\u06ff ]+$/;
// Tutor/tutor mangers name must be in Arabic - https://regex101.com/r/Av5SGH/1
export const TUTOR_NAME_REGEX = /^[\u0600-\u06ff\s]+$/;

/**
 * Interview duration in minutes.
 */
export const INTERVIEW_DURATION = 30;

export const CONFIRMATION_CODE_DIGIT_COUNT = 5;
export const CONFIRMATION_CODE_VALIDITY_MINUTES = 15;

export const NOTIFICATION_METHOD_TO_PURPOSE: Record<
  IUser.NotificationMethod,
  IConfirmationCode.Purpose
> = {
  [IUser.NotificationMethod.Whatsapp]: IConfirmationCode.Purpose.VerifyWhatsApp,
  [IUser.NotificationMethod.Telegram]: IConfirmationCode.Purpose.VerifyTelegram,
};

export const NOTIFICATION_METHOD_LITERAL_TO_NOTIFICATION_METHOD: Record<
  IUser.NotificationMethodLiteral,
  IUser.NotificationMethod
> = {
  whatsapp: IUser.NotificationMethod.Whatsapp,
  telegram: IUser.NotificationMethod.Telegram,
};

export const NOTIFICATION_METHOD_LITERAL_TO_PURPOSE: Record<
  IUser.NotificationMethodLiteral,
  IConfirmationCode.Purpose
> = {
  whatsapp: IConfirmationCode.Purpose.VerifyWhatsApp,
  telegram: IConfirmationCode.Purpose.VerifyTelegram,
};

export const NOTIFICATION_METHOD_TO_KAFKA_TOPIC: Record<
  IUser.NotificationMethod,
  IKafka.TopicType
> = {
  [IUser.NotificationMethod.Whatsapp]: "whatsapp",
  [IUser.NotificationMethod.Telegram]: "telegram",
};

export const NOTIFICATION_METHOD_LITERAL_TO_KAFKA_TOPIC: Record<
  IUser.NotificationMethodLiteral,
  IKafka.TopicType
> = {
  whatsapp: "whatsapp",
  telegram: "telegram",
};
