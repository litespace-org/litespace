import db from "@fixtures/db";
import { confirmationCodes, users } from "@litespace/models";
import chaiAsPromised from "chai-as-promised";
import {
  bad,
  expiredVerificationCode,
  invalidVerificationCode,
  unresolvedPhone,
} from "@/lib/error";
import dayjs from "@/lib/dayjs";
import { IConfirmationCode, ITelegram, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import handlers from "@/handlers/confirmationCode";
import { safe } from "@litespace/utils";
import { use as chaiUse, expect } from "chai";
import { messenger } from "@/lib/messenger";

chaiUse(chaiAsPromised);

const resolvePhoneMock = jest.spyOn(messenger.telegram, "resolvePhone");

const sendVerifyPhoneCode =
  mockApi<IConfirmationCode.SendVerifyPhoneCodePayload>(
    handlers.sendVerifyPhoneCode
  );

const verifyPhoneCode = mockApi<IConfirmationCode.VerifyPhoneCodePayload>(
  handlers.verifyPhoneCode
);

describe("/api/v1/confirmation-code", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/confirmation-code/send-verification-code", () => {
    it("should send the code successfully to a new phone number via whatsapp", async () => {
      const phone = "01018303125";
      const user = await db.student();

      expect(user.phone).to.null;
      const response = await safe(async () =>
        sendVerifyPhoneCode({ body: { phone, method: "whatsapp" }, user })
      );

      expect(response).to.not.be.instanceof(Error);

      const updatedUser = await users.findById(user.id);
      expect(updatedUser?.phone).to.eq(phone);

      const confirmationCode = await confirmationCodes.find({
        userId: user.id,
      });

      expect(confirmationCode).not.to.null;
    });

    it("should send the code successfully to a new phone number via telegram", async () => {
      const phone = "01018303125";
      const user = await db.student();

      resolvePhoneMock.mockImplementationOnce(() =>
        Promise.resolve({ id: 1 } as unknown as ITelegram.ResolvePhoneResponse)
      );

      const response = await safe(async () =>
        sendVerifyPhoneCode({
          body: { phone, method: "telegram" },
          user,
        })
      );

      expect(response).to.not.be.instanceof(Error);
      const updatedUser = await users.findById(user.id);
      expect(updatedUser?.phone).to.eq(phone);

      const confirmationCode = await confirmationCodes.find({
        userId: user.id,
      });
      expect(confirmationCode).not.to.null;
    });

    it("should send the code successfully to an existing user phone", async () => {
      const phone = "01018303125";
      const user = await db.student();
      users.update(user.id, {
        phone,
      });

      const response = await safe(async () =>
        sendVerifyPhoneCode({
          body: { phone, method: "whatsapp" },
          user,
        })
      );
      expect(response).to.not.be.instanceof(Error);

      const confirmationCode = await confirmationCodes.find({
        userId: user.id,
      });
      expect(confirmationCode).not.to.null;
    });

    it("should reject because we provided a different phone number", async () => {
      const phone = "01018303125";
      const user = await db.student();

      await users.update(user.id, { phone });
      const updatedUser = await users.findById(user.id);

      const response = await safe(async () =>
        sendVerifyPhoneCode({
          body: {
            phone: "01228769906",
            method: "whatsapp",
          },
          user: updatedUser!,
        })
      );

      expect(response).to.deep.eq(bad("Invalid or missing phone number"));
    });

    it("should reject because phone is invalid", async () => {
      const user = await users.create({
        role: IUser.Role.Student,
        email: "user@test.com",
      });

      const response = await safe(async () =>
        sendVerifyPhoneCode({
          body: { phone: "132186", method: "whatsapp" },
          user,
        })
      );

      expect(response).to.deep.eq(bad("Invalid or missing phone number"));
    });

    it("should reject because we phone is unresolved", async () => {
      const user = await db.student();

      resolvePhoneMock.mockImplementationOnce(() => Promise.resolve(null));

      const response = await safe(async () =>
        sendVerifyPhoneCode({
          body: {
            phone: "01018303124",
            method: "telegram",
          },
          user,
        })
      );
      expect(response).to.deep.eq(unresolvedPhone());
    });
  });

  describe("POST /api/v1/confirmation-code/verify", () => {
    it("should verify code successfully", async () => {
      const user = await db.student();
      const phone = "01018303125";
      users.update(user.id, {
        phone,
        notificationMethod: IUser.NotificationMethod.Telegram,
      });
      const code = await confirmationCodes.create({
        code: 1234,
        userId: user.id,
        expiresAt: dayjs.utc().add(5, "m").toISOString(),
        purpose: IConfirmationCode.Purpose.VerifyTelegram,
      });

      const response = await safe(async () =>
        verifyPhoneCode({
          body: { code: code.code, method: "telegram" },
          user,
        })
      );
      expect(response).to.not.be.instanceof(Error);

      const updatedUser = await users.findById(user.id);
      expect(updatedUser?.verifiedPhone).eq(true);
      expect(updatedUser?.notificationMethod).eq(
        IUser.NotificationMethod.Telegram
      );

      const deletedCode = await confirmationCodes.findById(code.id);
      expect(deletedCode).to.eq(null);
    });

    it("should reject due to invalid code", async () => {
      const user = await db.student();
      const phone = "01018303125";
      users.update(user.id, {
        phone,
        notificationMethod: IUser.NotificationMethod.Telegram,
      });
      await confirmationCodes.create({
        code: 1234,
        userId: user.id,
        expiresAt: dayjs.utc().add(5, "m").toISOString(),
        purpose: IConfirmationCode.Purpose.VerifyTelegram,
      });

      const response = await safe(async () =>
        verifyPhoneCode({
          body: { code: 1235, method: "telegram" },
          user,
        })
      );
      expect(response).to.deep.eq(invalidVerificationCode());
      const updatedUser = await users.findById(user.id);
      expect(updatedUser?.verifiedPhone).eq(false);
    });

    it("should reject due to expired code", async () => {
      const user = await db.student();
      const phone = "01018303125";
      users.update(user.id, {
        phone,
        notificationMethod: IUser.NotificationMethod.Telegram,
      });
      const code = await confirmationCodes.create({
        code: 1234,
        userId: user.id,
        expiresAt: dayjs.utc().subtract(5, "m").toISOString(),
        purpose: IConfirmationCode.Purpose.VerifyTelegram,
      });

      const response = await safe(async () =>
        verifyPhoneCode({
          body: { code: code.code, method: "telegram" },
          user,
        })
      );
      expect(response).to.deep.eq(expiredVerificationCode());
      const updatedUser = await users.findById(user.id);
      expect(updatedUser?.verifiedPhone).eq(false);

      const deletedCode = await confirmationCodes.findById(code.id);
      expect(deletedCode).to.eq(null);
    });
  });
});
