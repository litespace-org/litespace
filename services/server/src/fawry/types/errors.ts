export enum FawryStatusEnum {
  Ok,
  InvalidMechantCode,
  OrderNotFound,
  InvalidSignature,
  RefundAmountExceeded,
  OrderNotPaid,
  TransactionRefused,
  TransactionIncorrect,
  CardLostOrStolen,
  FraudCard,
  TransactionDeclined,
  TransactionFailed,
  ProcessingCardError,
  TransactionIncorrectAmount,
  InvalidCard,
  CardIssuerNotFound,
  IssuerNotResponding,
  AccountSetupError,
  CardNotAllowedByBank,
  FraudCardSuspected,
  LostCardNumber,
  CardNotAllowed,
  StolenCard,
  OnlineTransactionsNotAllowed,
  InsufficientFunds,
  ExpiredCard,
  IncorrectPinCode,
  CardNotFound,
  AccountConfigError,
  FraudulentTransaction,
  CardLimitExceeded,
  InvalidCardInRegion,
  SecurityChecksViolation,
  TransactionError,
  TransactionErrorFromBank,
  NotAllowedAmount,
  BankTechnicalError,
  BankContactingError,
  TransactionRouteError,
  TechnicalError,
  UnauthorizedCard,
  InvalidAmount,
}

export type FawryStatusCode =
  | 200
  | 9901
  | 9938
  | 9946
  | 9935
  | 9954
  | 99901
  | 99905
  | 99937
  | 99939
  | 99970
  | 99971
  | 99975
  | 99903
  | 99904
  | 99906
  | 99907
  | 99908
  | 99910
  | 99912
  | 99913
  | 99914
  | 99915
  | 99922
  | 99930
  | 99931
  | 99957
  | 99934
  | 99967
  | 99941
  | 99942
  | 99943
  | 99949
  | 99951
  | 99954
  | 99955
  | 99956
  | 99958
  | 99959
  | 99961
  | 99965
  | 99962
  | 99963
  | 99976
  | 99977
  | 99978
  | 99979
  | 99980
  | 99981
  | 99987
  | 99984
  | 99985
  | 21010
  | 99986
  | 99988
  | 99989
  | 99991
  | 99992
  | 99994
  | 99996
  | 55006
  | 21004;

export const FawryStatusMap: Record<FawryStatusCode, FawryStatusEnum> =
  Object.freeze({
    200: FawryStatusEnum.Ok,
    9901: FawryStatusEnum.InvalidMechantCode,
    9938: FawryStatusEnum.OrderNotFound,
    9946: FawryStatusEnum.InvalidSignature,
    9935: FawryStatusEnum.RefundAmountExceeded,
    9954: FawryStatusEnum.OrderNotPaid,
    99901: FawryStatusEnum.TransactionRefused,
    99905: FawryStatusEnum.TransactionRefused,
    99937: FawryStatusEnum.TransactionRefused,
    99939: FawryStatusEnum.TransactionRefused,
    99970: FawryStatusEnum.TransactionRefused,
    99971: FawryStatusEnum.TransactionRefused,
    99975: FawryStatusEnum.TransactionRefused,
    99903: FawryStatusEnum.TransactionIncorrect,
    99904: FawryStatusEnum.CardLostOrStolen,
    99906: FawryStatusEnum.FraudCard,
    99907: FawryStatusEnum.TransactionDeclined,
    99908: FawryStatusEnum.TransactionFailed,
    99910: FawryStatusEnum.TransactionFailed,
    99912: FawryStatusEnum.ProcessingCardError,
    99913: FawryStatusEnum.TransactionIncorrectAmount,
    99914: FawryStatusEnum.InvalidCard,
    99915: FawryStatusEnum.CardIssuerNotFound,
    99922: FawryStatusEnum.IssuerNotResponding,
    99930: FawryStatusEnum.AccountSetupError,
    99931: FawryStatusEnum.CardNotAllowedByBank,
    99957: FawryStatusEnum.CardNotAllowedByBank,
    99934: FawryStatusEnum.FraudCardSuspected,
    99967: FawryStatusEnum.FraudCardSuspected,
    99941: FawryStatusEnum.LostCardNumber,
    99942: FawryStatusEnum.CardNotAllowed,
    99943: FawryStatusEnum.StolenCard,
    99949: FawryStatusEnum.OnlineTransactionsNotAllowed,
    99951: FawryStatusEnum.InsufficientFunds,
    99954: FawryStatusEnum.ExpiredCard,
    99955: FawryStatusEnum.IncorrectPinCode,
    99956: FawryStatusEnum.CardNotFound,
    99958: FawryStatusEnum.AccountConfigError,
    99959: FawryStatusEnum.FraudulentTransaction,
    99961: FawryStatusEnum.CardLimitExceeded,
    99965: FawryStatusEnum.CardLimitExceeded,
    99962: FawryStatusEnum.InvalidCardInRegion,
    99963: FawryStatusEnum.SecurityChecksViolation,
    99976: FawryStatusEnum.TransactionError,
    99977: FawryStatusEnum.TransactionError,
    99978: FawryStatusEnum.TransactionError,
    99979: FawryStatusEnum.TransactionError,
    99980: FawryStatusEnum.TransactionError,
    99981: FawryStatusEnum.TransactionError,
    99987: FawryStatusEnum.TransactionError,
    99984: FawryStatusEnum.TransactionErrorFromBank,
    99985: FawryStatusEnum.NotAllowedAmount,
    21010: FawryStatusEnum.NotAllowedAmount,
    99986: FawryStatusEnum.BankTechnicalError,
    99988: FawryStatusEnum.BankTechnicalError,
    99989: FawryStatusEnum.BankTechnicalError,
    99991: FawryStatusEnum.BankContactingError,
    99992: FawryStatusEnum.TransactionRouteError,
    99994: FawryStatusEnum.TechnicalError,
    99996: FawryStatusEnum.TechnicalError,
    55006: FawryStatusEnum.UnauthorizedCard,
    21004: FawryStatusEnum.InvalidAmount,
  });

export enum CancelPaymentErrorEnum {
  Unauthorized,
  OrderNotFound,
  OrderAlreadyPaid,
  OrderAlreadyCancelled,
  InvalidMerchantCode,
  InvalidSignature,
}

export type CancelPaymentErrorCode =
  | 401
  | 404
  | 9938
  | 400
  | 9984
  | 9901
  | 9946;

export const CancelPaymentErrorCode: Record<
  CancelPaymentErrorCode,
  CancelPaymentErrorEnum
> = Object.freeze({
  401: CancelPaymentErrorEnum.Unauthorized,
  404: CancelPaymentErrorEnum.OrderNotFound,
  9938: CancelPaymentErrorEnum.OrderNotFound,
  400:
    CancelPaymentErrorEnum.OrderAlreadyPaid |
    CancelPaymentErrorEnum.OrderAlreadyCancelled,
  9984: CancelPaymentErrorEnum.OrderAlreadyCancelled,
  9901: CancelPaymentErrorEnum.InvalidMerchantCode,
  9946: CancelPaymentErrorEnum.InvalidSignature,
});
