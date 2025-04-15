import { confirmationCodes } from "@/confirmationCodes";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { IConfirmationCode } from "@litespace/types";
import { use, expect } from "chai";
import dayjs from "@/lib/dayjs";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

const EXPIRY = dayjs.utc().add(24, "hour").toISOString();
const VALID_CODE = 12345;

describe("Confirmation Codes", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(confirmationCodes.create), () => {
    it("should return and create new code", async () => {
      const code = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });
      expect(code.code).to.be.eq(VALID_CODE);
      expect(code.purpose).to.be.eq(IConfirmationCode.Purpose.ResetPassword);
    });

    it("should fail and never accept any number above 5 digits", async () => {
      await expect(
        confirmationCodes.create({
          code: 123456, // 6 digits (should fail)
          purpose: IConfirmationCode.Purpose.ResetPassword,
          expiresAt: EXPIRY,
        })
      ).to.eventually.be.rejectedWith(/out of range for type smallint/);
    });

    it("should succeed and return 2 codes", async () => {
      const c1 = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      const c2 = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.VerifyEmail,
        expiresAt: EXPIRY,
      });
      expect(c1.code).to.be.eq(VALID_CODE);
      expect(c1.purpose).to.be.eq(IConfirmationCode.Purpose.ResetPassword);
      expect(c2.code).to.be.eq(VALID_CODE);
      expect(c2.purpose).to.be.eq(IConfirmationCode.Purpose.VerifyEmail);
    });

    it("should fail due to duplicate codes and purposes", async () => {
      const user = await fixtures.user({});
      await confirmationCodes.create({
        userId: user.id,
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      await expect(
        confirmationCodes.create({
          userId: user.id,
          code: VALID_CODE,
          purpose: IConfirmationCode.Purpose.ResetPassword,
          expiresAt: EXPIRY,
        })
      ).eventually.be.rejectedWith(/violates unique constraint/);
    });
  });

  describe(nameof(confirmationCodes.findById), () => {
    it("should return code", async () => {
      const created = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      const code = await confirmationCodes.findById(created.id);
      if (!code) return;
      expect(code.code).to.be.eq(VALID_CODE);
      expect(code.purpose).to.be.eq(IConfirmationCode.Purpose.ResetPassword);
    });

    it("should return null", async () => {
      const code = await confirmationCodes.findById(5);
      return expect(code).to.be.eq(null);
    });
  });

  describe(nameof(confirmationCodes.find), () => {
    it("should return code", async () => {
      await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      const [code] = await confirmationCodes.find({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
      });
      expect(code.code).to.be.eq(VALID_CODE);
      expect(code.purpose).to.be.eq(IConfirmationCode.Purpose.ResetPassword);
    });

    it("should return mutliple codes", async () => {
      await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.VerifyEmail,
        expiresAt: EXPIRY,
      });

      const code = await confirmationCodes.find({
        code: VALID_CODE,
      });

      if (!code) return;
      expect(code.length).to.be.eq(2);
      expect(code[0].code).to.be.eq(VALID_CODE);
      expect(code[0].purpose).to.be.eq(IConfirmationCode.Purpose.ResetPassword);
      expect(code[1].code).to.be.eq(VALID_CODE);
      expect(code[1].purpose).to.be.eq(IConfirmationCode.Purpose.VerifyEmail);
    });

    it("should return null", async () => {
      const code = await confirmationCodes.find({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
      });
      expect(code.length).to.be.eq(0);
    });
  });

  describe(nameof(confirmationCodes.deleteById), () => {
    it("should delete code", async () => {
      const created = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      await confirmationCodes.deleteById({ id: created.id });
      const code = await confirmationCodes.findById(created.id);
      expect(code).to.be.eq(null);
    });
  });

  describe(nameof(confirmationCodes.deleteByCodeAndPurpose), () => {
    it("should delete code", async () => {
      const created = await confirmationCodes.create({
        code: VALID_CODE,
        purpose: IConfirmationCode.Purpose.ResetPassword,
        expiresAt: EXPIRY,
      });

      await confirmationCodes.deleteByCodeAndPurpose({
        code: created.code,
        purpose: created.purpose,
      });
      const code = await confirmationCodes.findById(created.id);
      expect(code).to.be.eq(null);
    });
  });
});
