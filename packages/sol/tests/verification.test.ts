import { faker } from "@faker-js/faker";
import {
  isValidCouponExpireDate,
  isValidCouponDiscount,
  isValidCouponCode,
  isValidEmail,
  isValidInterviewFeedback,
  isValidInterviewLevel,
  isValidInterviewNote,
  isValidPassword,
  isValidPlanAlias,
  isValidPlanDiscount,
  isValidPlanPrice,
  isValidPlanWeeklyMinutes,
  isValidRatingText,
  isValidRatingValue,
  isValidRuleDuration,
  isValidRuleEnd,
  isValidRuleStart,
  isValidRuleTitle,
  isValidTutorAbout,
  isValidTutorBio,
  isValidTutorNotice,
  isValidUserBirthYear,
  isValidUserName,
  isValidMessageText,
  isValidWithdrawMinAmount,
  isValidWithdrawMaxAmount,
  isValidInvoiceAmount,
  isValidInvoiceNote,
} from "@/verification";
import { FieldError } from "@litespace/types";

describe("email validation", () => {
  it("should accept these valid emails", () => {
    expect(isValidEmail("john@gmail.com")).toBe(true);
    expect(isValidEmail("john.doe@gmail.com")).toBe(true);
    expect(isValidEmail("john-doe@gmail.com")).toBe(true);
    expect(isValidEmail("john_doe@gmail.com")).toBe(true);
    expect(isValidEmail("6johndoe@gmail.com")).toBe(true);
    expect(isValidEmail("-johndoe@gmail.com")).toBe(true);
  });
  it("should reject email without @ character", () => {
    expect(isValidEmail("johngmail.com")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email with unappropriate domain name", () => {
    expect(isValidEmail("john@gmail.c")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email with double @", () => {
    expect(isValidEmail("j@ohn@gmail.com")).toBe(FieldError.InvalidEmail);
  });
  it("should reject email start with non word char", () => {
    expect(isValidEmail("#john@gmail.com")).toBe(FieldError.InvalidEmail);
  });
});

describe("validate password", () => {
  it("should accept these password with 8 or more characters, letters and numbers", () => {
    expect(isValidPassword("Abc12345678")).toBe(true);
    expect(isValidPassword("abcABC1234567890")).toBe(true);
  });
  it("should reject password less than 8 characters", () => {
    expect(isValidPassword("Ab1234")).toBe(FieldError.PasswordTooShort);
  });
  it("should reject password without any letter", () => {
    expect(isValidPassword("12345678")).toBe(FieldError.PasswordMissingLetters);
  });
  it("should reject password without any numbers", () => {
    expect(isValidPassword("Abcdefgh")).toBe(FieldError.PasswordMissingNumbers);
  });
});

describe("validate username", () => {
  it("should accept this username", () => {
    expect(isValidUserName("زيد محمد")).toBe(true);
  });
  it("should reject user name contains non arabic letters", () => {
    expect(isValidUserName("ed زيد")).toBe(FieldError.InvalidUserName);
  });
  it("should reject user name that contains numbers", () => {
    expect(isValidUserName("زيد 78")).toBe(FieldError.InvalidUserName);
  });
  it("should reject user name that contains symbols", () => {
    expect(isValidUserName("زيد_عمر")).toBe(FieldError.InvalidUserName);
  });
});

// // Tutor fields validations
describe("user birth year validation", () => {
  it("should accept user with age in range 10-60", () => {
    expect(isValidUserBirthYear(new Date().getFullYear() - 10)).toBe(true);
    expect(isValidUserBirthYear(new Date().getFullYear() - 30)).toBe(true);
    expect(isValidUserBirthYear(new Date().getFullYear() - 60)).toBe(true);
  });
  it("should reject user with age out of range 10-60", () => {
    expect(isValidUserBirthYear(new Date().getFullYear() - 9)).toBe(
      FieldError.TutorTooYoung
    );
    expect(isValidUserBirthYear(new Date().getFullYear() - 61)).toBe(
      FieldError.TutorTooOld
    );
  });
});

describe("tutor bio validation", () => {
  it("should accept bio in range 1-60 chars", () => {
    expect(
      isValidTutorBio(
        "<div><h1>John</h1><p>specialized tutor in personalized learning and growth.</p></div>"
      )
    ).toBe(true);
  });
  it("should reject bio less than 1 char", () => {
    expect(isValidTutorBio("")).toBe(FieldError.TutorBioEmpty);
  });
  it("should reject bio exceeding 60 chars", () => {
    expect(
      isValidTutorBio(
        "<div><h1>John doe</h1><p>Experienced tutor specialized in personalized learning and growth.</p></div>"
      )
    ).toBe(FieldError.TutorBioTooLong);
  });
});

describe("tutor about validation", () => {
  it("should accept about in range 1-1000 chars", () => {
    expect(
      isValidTutorAbout(
        "<div><h3>about john doe</h3><p>A tutor guides students, helps with learning, explains concepts simply, and improves understanding step by step.</p></div>"
      )
    ).toBe(true);
  });
  it("should reject empty tutor about", () => {
    expect(isValidTutorAbout("<span></span>")).toBe(FieldError.TutorAboutEmpty);
  });
  it("should reject tutor about with more than 1000 letters", () => {
    const fakeTutorAbout = `<div>${faker.lorem.sentence({
      min: 1050,
      max: 1200,
    })}</div>`;

    expect(isValidTutorAbout(fakeTutorAbout)).toBe(
      FieldError.TutorAboutTooLong
    );
  });
});

describe("tutor notice validation", () => {
  it("should accept tutor notice beteen 0 and 24 hours", () => {
    expect(isValidTutorNotice(20)).toBe(true);
  });
  it("should reject notice with minus number", () => {
    expect(isValidTutorNotice(-1)).toBe(FieldError.TutorNoticeMinus);
  });
  it("should reject notice more than 24 hours", () => {
    expect(isValidTutorNotice(1441)).toBe(FieldError.TutorNoticeTooLong);
  });
});

describe("rule title validation", () => {
  it("should accept title in range 5-255 chars", () => {
    expect(isValidRuleTitle("<h1>Rule Title</h1>")).toBe(true);
  });
  it("should reject title less than 5 char", () => {
    expect(isValidRuleTitle("<div>rule</div>")).toBe(
      FieldError.RuleTitleTooShort
    );
  });
  it("should reject title exceeding 255 chars", () => {
    const fakeRuleTitle = `<div>${faker.lorem.sentences({
      min: 300,
      max: 350,
    })}</div>`;

    expect(isValidRuleTitle(fakeRuleTitle)).toBe(FieldError.RuleTitleTooLong);
  });
});

describe("rule start validation", () => {
  it("should accept a rule start ISO valid, not in the past and not after the rule end", () => {
    expect(isValidRuleStart("10-24-2024", "11-24-2024")).toBe(true);
  });
  it("should reject a rule with an ISO invalid start date", () => {
    expect(isValidRuleStart("24/10/2024", "11-24-2024")).toBe(
      FieldError.RuleStartISOInvalid
    );
    expect(isValidRuleStart("10/2024", "11-24-2024")).toBe(
      FieldError.RuleStartISOInvalid
    );
  });
  it("should reject a rule which has start date on the past", () => {
    expect(isValidRuleStart("10/20/2024", "12/20/2025")).toBe(
      FieldError.RuleStartDatePassed
    );
  });
  it("should reject a rule which has start date after the end date", () => {
    expect(isValidRuleStart("10/29/2024", "10/27/2024")).toBe(
      FieldError.RuleStartAfterEnd
    );
  });
});
describe("rule end validation", () => {
  it("should accept a rule with end date ISO valid, after start date and after current time", () => {
    expect(isValidRuleEnd("3/10/2025", "11/10/2024")).toBe(true);
  });
  it("should reject a rule with ISO invalid end date", () => {
    expect(isValidRuleEnd("11/2024", "10/29/2024")).toBe(
      FieldError.RuleEndISOInvalid
    );
  });
  it("should reject a rule with passed end date", () => {
    expect(isValidRuleEnd("10/11/2024", "5/29/2024")).toBe(
      FieldError.RuleEndDatePassed
    );
  });
  it("should reject a rule with end date before start date", () => {
    expect(isValidRuleEnd("10/29/2024", "11/11/2024")).toBe(
      FieldError.RuleEndBeforeStart
    );
  });
});
describe("rule duration validation", () => {
  it("should accept a rule duration between 0 and 8 hours", () => {
    expect(isValidRuleDuration(0)).toBe(true);
    expect(isValidRuleDuration(120)).toBe(true);
    expect(isValidRuleDuration(480)).toBe(true);
  });
  it("should reject a rule duration with minus number", () => {
    expect(isValidRuleDuration(-1)).toBe(FieldError.RuleDurationMinus);
  });
  it("should reject a rule duration more than 8 hours", () => {
    expect(isValidRuleDuration(961)).toBe(FieldError.RuleDuratoinTooLong);
  });
});
describe("interview feedback validation", () => {
  it("should accept an interview feedback which is valid html and text range between 5-1000", () => {
    expect(
      isValidInterviewFeedback(
        "<div><p>this is positive feedback about this tutor </p></div>"
      )
    ).toBe(true);
  });
  it("should reject feedback less than 5 characters", () => {
    expect(isValidInterviewFeedback("<div>five</div>")).toBe(
      FieldError.InterviewFeedbackTooShort
    );
  });
  it("should reject feedback which is not valid html", () => {
    expect(isValidInterviewFeedback("five characters")).toBe(
      FieldError.InterviewFeedbackInvalidHTML
    );
  });
  it("should reject feedback which is more than 1000 characters", () => {
    const fakeFeedback = `<div>${faker.lorem.sentences({
      min: 1020,
      max: 1230,
    })}</div>`;
    expect(isValidInterviewFeedback(fakeFeedback)).toBe(
      FieldError.InterviewFeedbackTooLong
    );
  });
});
describe("interview note validation", () => {
  it("should accept an interview note which is valid html and text range between 5-1000", () => {
    expect(
      isValidInterviewNote(
        "<div><p>this is positive feedback about this tutor </p></div>"
      )
    ).toBe(true);
  });
  it("should reject note less than 5 characters", () => {
    expect(isValidInterviewNote("<div>five</div>")).toBe(
      FieldError.InterviewNoteTooShort
    );
  });
  it("should reject note which is not valid html", () => {
    expect(isValidInterviewNote("five characters")).toBe(
      FieldError.InterviewNoteInvalidHTML
    );
  });
  it("should reject note which is more than 1000 characters", () => {
    const fakeNote = `<div>${faker.lorem.sentences({
      min: 1020,
      max: 1230,
    })}</div>`;
    expect(isValidInterviewNote(fakeNote)).toBe(
      FieldError.InterviewNoteTooLong
    );
  });
});
describe("interview level validation", () => {
  it("should accept a level between 1 and 5", () => {
    expect(isValidInterviewLevel(1)).toBe(true);
    expect(isValidInterviewLevel(3)).toBe(true);
    expect(isValidInterviewLevel(5)).toBe(true);
  });
  it("should reject level above 5", () => {
    expect(isValidInterviewLevel(7)).toBe(FieldError.InterviewLevelAboveRange);
  });
  it("should reject level above 5", () => {
    expect(isValidInterviewLevel(0)).toBe(FieldError.InterviewLevelBelowRange);
    expect(isValidInterviewLevel(-1)).toBe(FieldError.InterviewLevelBelowRange);
  });
});
describe("rating value validation", () => {
  it("should accept a rating value between 1 and 5", () => {
    expect(isValidRatingValue(1)).toBe(true);
    expect(isValidRatingValue(3)).toBe(true);
    expect(isValidRatingValue(5)).toBe(true);
  });
  it("should reject level above 5", () => {
    expect(isValidRatingValue(7)).toBe(FieldError.RatingValueAboveRange);
  });
  it("should reject level above 5", () => {
    expect(isValidRatingValue(0)).toBe(FieldError.RatingValueBelowRange);
    expect(isValidRatingValue(-1)).toBe(FieldError.RatingValueBelowRange);
  });
});
describe("rating text validation", () => {
  const fakeRatingText = faker.lorem.word(255);
  it("should accept a valid rating text range between 3-255", () => {
    expect(isValidRatingText("text vlue")).toBe(true);
    expect(isValidRatingText("foo")).toBe(true);
    expect(isValidRatingText(fakeRatingText)).toBe(true);
  });
  it("should reject text more than 255 chars", () => {
    const fakeRatingText = faker.lorem.sentence(270);
    expect(isValidRatingText(fakeRatingText)).toBe(
      FieldError.RatingTextTooLong
    );
  });
  it("should reject text less than 3 chars", () => {
    expect(isValidRatingText("me")).toBe(FieldError.RatingTextTooShort);
  });
});
describe("plan alias validation", () => {
  it("should accept a valid plan alias range between 3-255", () => {
    expect(isValidPlanAlias("text vlue")).toBe(true);
    expect(isValidPlanAlias("foo")).toBe(true);
  });
  it("should reject text more than 255 chars", () => {
    const fakePlanAlias = faker.lorem.sentence(270);
    expect(isValidPlanAlias(fakePlanAlias)).toBe(FieldError.PlanAliasTooLong);
  });
  it("should reject alias less than 3 chars", () => {
    expect(isValidPlanAlias("me")).toBe(FieldError.PlanAliasTooShort);
  });
});
describe("plan weekly minutes validation", () => {
  it("should accept a plan with weekly minutes between 1 and less that week", () => {
    expect(isValidPlanWeeklyMinutes(1)).toBe(true);
    expect(isValidPlanWeeklyMinutes(60)).toBe(true);
    expect(isValidPlanWeeklyMinutes(10080)).toBe(true);
  });
  it("should reject weekly minutes more than one week duration", () => {
    expect(isValidPlanWeeklyMinutes(10081)).toBe(
      FieldError.PlanWeeklyMinutesAboveWeek
    );
  });
  it("should reject weekly minutes less than 0 (minus)", () => {
    expect(isValidPlanWeeklyMinutes(-3)).toBe(
      FieldError.PlanWeeklyMinutesAbsent
    );
  });
});
describe("plan price validation", () => {
  it("should accept a valid plan price not minus, zero, infinite or not integer", () => {
    expect(isValidPlanPrice(100, 10)).toBe(true);
    expect(isValidPlanPrice(1, 10)).toBe(true);
  });
  it("should reject plan price which is infinite", () => {
    expect(isValidPlanPrice(Math.pow(10, 1000), 10)).toBe(
      FieldError.PlanPriceInfinte
    );
  });
  it("should reject plan price which is zero", () => {
    expect(isValidPlanPrice(0, 10)).toBe(FieldError.PlanPriceZeroOrNegative);
  });
  it("should reject plan price with 100% discount", () => {
    expect(isValidPlanPrice(100, 100)).toBe(FieldError.PlanTotalDiscount);
  });
  it("should reject plan price with non integer number", () => {
    expect(isValidPlanPrice(6.6, 39)).toBe(FieldError.PlanPriceNotInteger);
  });
});
describe("plan discount validation", () => {
  it("should accept discount between 0 and 100", () => {
    expect(isValidPlanDiscount(20)).toBe(true);
  });
  it("should reject discount below or equal 0", () => {
    expect(isValidPlanDiscount(0)).toBe(FieldError.PlanDiscountZeroOrNegative);
    expect(isValidPlanDiscount(-23)).toBe(
      FieldError.PlanDiscountZeroOrNegative
    );
  });
  it("should reject discount above 100", () => {
    expect(isValidPlanDiscount(102)).toBe(
      FieldError.PlanDiscountAbove100Percent
    );
  });
});
describe("coupon code validation", () => {
  it("should accept valid coupon code containing english letters, numbers or symbols", () => {
    expect(isValidCouponCode("1234")).toBe(true);
    expect(isValidCouponCode("English")).toBe(true);
    expect(isValidCouponCode("E+-nglish")).toBe(true);
  });
  it("should reject coupon code with another lang other than english", () => {
    expect(isValidCouponCode("كوبون")).toBe(FieldError.CouponCodeInvalid);
  });
});
describe("coupon code discount validation", () => {
  it("should accept discount between 0 and 100", () => {
    expect(isValidCouponDiscount(20)).toBe(true);
  });
  it("should reject discount below or equal 0", () => {
    expect(isValidCouponDiscount(0)).toBe(
      FieldError.CouponDiscountZeroOrNegative
    );
    expect(isValidCouponDiscount(-23)).toBe(
      FieldError.CouponDiscountZeroOrNegative
    );
  });
  it("should reject discount above 100", () => {
    expect(isValidPlanDiscount(102)).toBe(
      FieldError.PlanDiscountAbove100Percent
    );
  });
});
describe("coupon expire date validation", () => {
  it("should accept ISO valid dates and not to be before current time", () => {
    expect(isValidCouponExpireDate("3/2/2025")).toBe(true);
  });
  it("should reject invalid ISO dates", () => {
    expect(isValidCouponExpireDate("13/10/2025")).toBe(
      FieldError.CouponExpireDateInvalid
    );
  });
  it("should reject expire date before the current date", () => {
    expect(isValidCouponExpireDate("10/1/2013")).toBe(
      FieldError.CouponExpireDateBeforeToday
    );
  });
});
describe("message text validation", () => {
  it("should accept valid message text that in english letters, symobols and numbers in HTML form", () => {
    expect(isValidMessageText("<div>Hello 123!</div>")).toBe(true);
  });
  it("should reject messages less than 1 char", () => {
    expect(isValidMessageText("<div></div>")).toBe(
      FieldError.MessageTextTooShort
    );
  });
  it("should reject messages more than 1000 chars", () => {
    const fakeMessage = `<div>${faker.lorem.sentences({
      min: 1020,
      max: 1230,
    })}</div>`;
    expect(isValidMessageText(fakeMessage)).toBe(FieldError.MessageTextTooLong);
  });
  it("should reject non HTML string", () => {
    expect(isValidMessageText("hello")).toBe(FieldError.MessageTextInvalidHTML);
  });
});
describe("withdraw min amount validation", () => {
  it("should accept min amount more than zero and not exceed max amount", () => {
    expect(isValidWithdrawMinAmount(30, 70)).toBe(true);
  });
  it("should reject min amount equal to or less than zero", () => {
    expect(isValidWithdrawMinAmount(0, 30)).toBe(
      FieldError.WithdrawMinAmountZeroOrNegative
    );
    expect(isValidWithdrawMinAmount(-10, 30)).toBe(
      FieldError.WithdrawMinAmountZeroOrNegative
    );
  });
  it("should reject min amount greater than max amount", () => {
    expect(isValidWithdrawMinAmount(60, 39)).toBe(
      FieldError.WithdrawMinAmountAboveMaxAmount
    );
  });
});
describe("withdraw max amount validation", () => {
  it("should accept max amount more than zero", () => {
    expect(isValidWithdrawMaxAmount(70, 20)).toBe(true);
  });
  it("should reject max amount equal to or less than zero", () => {
    expect(isValidWithdrawMaxAmount(0, 2)).toBe(
      FieldError.WithdrawMaxAmountZeroOrNegative
    );
    expect(isValidWithdrawMaxAmount(-10, -40)).toBe(
      FieldError.WithdrawMaxAmountZeroOrNegative
    );
  });
  it("should reject min amount greater than max amount", () => {
    expect(isValidWithdrawMaxAmount(60, 65)).toBe(
      FieldError.WithdrawMinAmountAboveMaxAmount
    );
  });
});
describe("invoice receiver validation", () => {});
describe("invoice amount validation", () => {
  it("should accept amount between min and max available amount and not = 0", () => {
    expect(isValidInvoiceAmount(60, 40, 100)).toBe(true);
  });
  it("should reject amount greater than max amount", () => {
    expect(isValidInvoiceAmount(120, 40, 100)).toBe(
      FieldError.InvoiceMoreMaxAmount
    );
  });
  it("should reject amount less than min amount", () => {
    expect(isValidInvoiceAmount(20, 40, 100)).toBe(
      FieldError.InvoiceLessMinAmount
    );
  });
  it("should reject amount equal to or less that zero", () => {
    expect(isValidInvoiceAmount(0, 50, 200)).toBe(
      FieldError.InvoiceAmountZeroOrNegative
    );
    expect(isValidInvoiceAmount(-10, 50, 200)).toBe(
      FieldError.InvoiceAmountZeroOrNegative
    );
  });
});
describe("invoice note validation", () => {
  it("should accept note between 1 - 1000 chars and to be valid HTML", () => {
    expect(isValidInvoiceNote("<div>Hello</div>")).toBe(true);
  });
  it("should reject invalid html", () => {
    expect(isValidInvoiceNote("not valid html")).toBe(
      FieldError.InvoiceNoteInvalidHTML
    );
  });
  it("should reject note less than 1 char", () => {
    expect(isValidInvoiceNote("<div></div>")).toBe(FieldError.InvoiceNoteEmpty);
  });
  it("should reject note more that 1000 chars", () => {
    const fakeNote = `<div>${faker.lorem.sentences({
      min: 1020,
      max: 1230,
    })}</div>`;
    expect(isValidInvoiceNote(fakeNote)).toBe(FieldError.InvoiceNoteTooLong);
  });
});
