/**
 * this's defined by fawry docs (cannot be changed or extended)
 * https://developer.fawrystaging.com/docs/card-tokens/create-use-token#key_value_list
 */
export type AddCardPayload = {
  card: {
    token: string,
    creationDate: number,
    lastFourDigits: string,
    firstSixDigits: string,
    brand: string,
  },
  statusCode: number,
  statusDescription: string,
};

