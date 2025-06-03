import { confirmationCodes } from "@/confirmationCodes";
import { fixtures } from "@litespace/tests";
import { nameof } from "@litespace/utils/utils";
import { IConfirmationCode } from "@litespace/types";
import { use, expect } from "chai";
import dayjs from "@/lib/dayjs";
import chaiAsPromised from "chai-as-promised";
import time from "@fixtures/time";

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

  describe(nameof(confirmationCodes.delete), () => {
    it("should delete by code ids", async () => {
      const c1 = await confirmationCodes.create({
        code: 1,
        expiresAt: time.iso(1),
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      const c2 = await confirmationCodes.create({
        code: 1,
        expiresAt: time.iso(1),
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      await confirmationCodes.delete({ ids: [c1.id] });

      await expect(confirmationCodes.findById(c1.id)).to.eventually.be.null;

      await expect(confirmationCodes.findById(c2.id)).to.eventually.not.be.null;
    });

    it("should delete codes the belongs to a given user", async () => {
      const u1 = await fixtures.user({});
      const u2 = await fixtures.user({});

      await confirmationCodes.create({
        code: 1,
        expiresAt: time.iso(1),
        userId: u1.id,
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      await confirmationCodes.create({
        code: 2,
        userId: u1.id,
        expiresAt: time.iso(1),
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      await confirmationCodes.create({
        code: 1,
        userId: u2.id,
        expiresAt: time.iso(1),
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      await confirmationCodes.delete({ users: [u1.id] });

      await expect(confirmationCodes.find({ userId: u1.id })).to.eventually.be
        .empty;

      await expect(
        confirmationCodes.find({ userId: u2.id })
      ).to.eventually.be.of.length(1);
    });

    it("should delete codes the belongs to a given user under a given purpose", async () => {
      const u1 = await fixtures.user({});

      const c1 = await confirmationCodes.create({
        code: 1,
        expiresAt: time.iso(1),
        userId: u1.id,
        purpose: IConfirmationCode.Purpose.VerifyWhatsApp,
      });

      const c2 = await confirmationCodes.create({
        code: 2,
        userId: u1.id,
        expiresAt: time.iso(1),
        purpose: IConfirmationCode.Purpose.VerifyTelegram,
      });

      await confirmationCodes.delete({
        users: [u1.id],
        purposes: [IConfirmationCode.Purpose.VerifyWhatsApp],
      });

      await expect(confirmationCodes.findById(c1.id)).to.eventually.be.null;

      await expect(confirmationCodes.findById(c2.id)).to.eventually.be.not.null;
    });
  });
});
