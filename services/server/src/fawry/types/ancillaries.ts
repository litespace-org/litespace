export type PaymentMethod = "PAYATFAWRY" | "MWALLET" | "CARD";
export type CurrencyCode = "EGP";
export type Language = "ar-eg";
export type OrderStatus =
  | "NEW"
  | "PAID"
  | "CANCELED"
  | "REFUNDED"
  | "EXPIRED"
  | "PARTIAL_REFUNDED"
  | "FAILED";
export enum VerStatus {
  CARD_AUTHENTICATED = "Y",
  CARD_HOLDER_NOT_ENROLLED = "E",
  CARD_HOLDER_NOT_VERIFIED = "N",
  ISSUER_SYSTEM_ERROR = "U",
  BAD_REQUEST = "F",
  AUTHENTICATION_FAILED = "A",
  CONNECTION_ERROR = "D",
  CARD_NOT_SUPPORTED = "C",
  CANCELED = "M",
  VALIDATION_ERROR = "S",
  TIMEOUT_ERROR = "T",
  PARSING_INPUT_ERROR = "P",
  INTERNAL_SERVER_ERROR = "I",
}
