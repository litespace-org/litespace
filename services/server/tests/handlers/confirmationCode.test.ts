import db from "@fixtures/db";
import { confirmationCodes, users } from "@litespace/models";
import chaiAsPromised from "chai-as-promised";
import {
  bad,
  expiredVerificationCode,
  invalidPhone,
  invalidVerificationCode,
  phoneAlreadyVerified,
  unResolvedPhone,
} from "@/lib/error";
import dayjs from "@/lib/dayjs";
import { IConfirmationCode, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import handlers from "@/handlers/confirmationCode";
import { safe } from "@litespace/utils";
import { use as chaiUse, expect } from "chai";

chaiUse(chaiAsPromised);

const sendCode = mockApi<IConfirmationCode.SendCodePayload>(handlers.sendCode);

const verifyCode = mockApi<IConfirmationCode.VerifyCodePayload>(
  handlers.verifyCode
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
        sendCode({
          body: { phone, method: IUser.NotificationMethod.Whatsapp },
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

    it("should send the code successfully to a new phone number via telegram", async () => {
      const phone = "01018303125";
      const user = await db.student();

      const response = await safe(async () =>
        sendCode({
          body: { phone, method: IUser.NotificationMethod.Telegram },
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
        sendCode({
          body: {
            phone,
            method: IUser.NotificationMethod.Whatsapp,
          },
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

      await users.update(user.id, {
        phone,
      });
      const updatedUser = await users.findById(user.id);

      const response = await safe(async () =>
        sendCode({
          body: {
            phone: "01228769906",
            method: IUser.NotificationMethod.Whatsapp,
          },
          user: updatedUser!,
        })
      );

      expect(response).to.deep.eq(bad());
    });

    it("should reject because we phone is already verified", async () => {
      const phone = "01018303125";
      const user = await db.student();

      await users.update(user.id, {
        phone,
        notificationMethod: IUser.NotificationMethod.Whatsapp,
        verifiedPhone: true,
      });

      const updatedUser = await users.findById(user.id);

      const response = await safe(async () =>
        sendCode({
          body: {
            phone: "01018303125",
            method: IUser.NotificationMethod.Whatsapp,
          },
          user: updatedUser!,
        })
      );

      expect(response).to.deep.eq(phoneAlreadyVerified());
    });

    it("should reject because we phone is invalid", async () => {
      const user = await db.student();

      const response = await safe(async () =>
        sendCode({
          body: {
            phone: "132186",
            method: IUser.NotificationMethod.Whatsapp,
          },
          user,
        })
      );

      expect(response).to.deep.eq(invalidPhone());
    });

    it("should reject because we phone is unresolved", async () => {
      const user = await db.student();

      const response = await safe(async () =>
        sendCode({
          body: {
            phone: "01018303124",
            method: IUser.NotificationMethod.Telegram,
          },
          user,
        })
      );
      expect(response).to.deep.eq(unResolvedPhone());
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
        verifyCode({
          body: { code: code.code, method: IUser.NotificationMethod.Telegram },
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
        verifyCode({
          body: { code: 1235, method: IUser.NotificationMethod.Telegram },
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
        verifyCode({
          body: { code: code.code, method: IUser.NotificationMethod.Telegram },
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
