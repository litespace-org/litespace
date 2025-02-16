import {
  COUPON_REGEX,
  MAX_DISCOUNT_VALUE,
  MIN_DISCOUNT_VALUE,
} from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidCouponCode(
  couponCode: string
): FieldError.InvalidCouponCode | true {
  if (!COUPON_REGEX.test(couponCode)) return FieldError.InvalidCouponCode;
  return true;
}
export function isValidCouponDiscount(
  couponDiscount: number
): FieldError.ZeroCouponDiscount | FieldError.MaxCouponDiscountExceeded | true {
  if (couponDiscount <= MIN_DISCOUNT_VALUE)
    return FieldError.ZeroCouponDiscount;
  if (couponDiscount > MAX_DISCOUNT_VALUE)
    return FieldError.MaxCouponDiscountExceeded;
  return true;
}
export function isValidCouponExpireDate(
  expireDate: string
):
  | FieldError.ExpiredCouponExpireDate
  | FieldError.InvalidCouponExpireDate
  | true {
  if (!Date.parse(expireDate)) return FieldError.InvalidCouponExpireDate;
  if (new Date() > new Date(expireDate))
    return FieldError.ExpiredCouponExpireDate;
  return true;
}
