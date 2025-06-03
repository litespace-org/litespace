import { fixtures as db, mockApi } from "@litespace/tests";
import { confirmationCodes, users } from "@litespace/models";
import {
  bad,
  emailAlreadyVerified,
  expiredVerificationCode,
  forbidden,
  invalidVerificationCode,
  notfound,
  unresolvedPhone,
} from "@/lib/error";
import dayjs from "@/lib/dayjs";
import { IConfirmationCode, ITelegram, IUser } from "@litespace/types";
import handlers from "@/handlers/confirmationCode";
import { safe, safePromise } from "@litespace/utils";
import { expect } from "chai";
import { messenger } from "@/lib/messenger";
import { generateConfirmationCode } from "@/lib/confirmationCodes";
import { ZodError } from "zod";

const resolvePhoneMock = jest.spyOn(messenger.telegram, "resolvePhone");

const sendVerifyPhoneCode =
  mockApi<IConfirmationCode.SendVerifyPhoneCodePayload>(
    handlers.sendVerifyPhoneCode
  );

const verifyPhoneCode = mockApi<IConfirmationCode.VerifyPhoneCodePayload>(
  handlers.verifyPhoneCode
);

const sendForgetPasswordCode =
  mockApi<IConfirmationCode.SendForgetPasswordEmailPayload>(
    handlers.sendForgetPasswordCode
  );

const confirmForgetPasswordCode = mockApi<
  IConfirmationCode.ConfirmForgetPasswordCodePayload,
  void,
  void,
  IConfirmationCode.ConfirmPasswordCodeApiResponse
>(handlers.confirmForgetPasswordCode);

const sendEmailVerificationCode = mockApi(handlers.sendEmailVerificationCode);

const confirmEmailVerificationCode =
  mockApi<IConfirmationCode.VerifyEmailPayload>(
    handlers.confirmEmailVerificationCode
  );

describe("/api/v1/confirmation-code", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/confirmation-code/phone/send", () => {
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

      expect(confirmationCode).to.not.be.null;
    });

    it("should send the code successfully to a new phone number via telegram", async () => {
      const phone = "01018303125";
      const user = await db.student();

      resolvePhoneMock.mockImplementationOnce(() =>
        Promise.resolve({ id: 1 } as unknown as ITelegram.ResolvePhoneResponse)
      );

      const response = await safePromise(
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
      expect(confirmationCode).to.not.be.null;
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
      expect(confirmationCode).to.not.be.null;
    });

    it("should ignore the payload because we provided a different phone number", async () => {
      const phone = "01018303125";
      const user = await db.student();

      await users.update(user.id, { phone });
      const updatedUser = await users.findById(user.id);

      await safePromise(
        sendVerifyPhoneCode({
          body: {
            phone: "01228769906",
            method: "whatsapp",
          },
          user: updatedUser!,
        })
      );

      const updated = await users.findById(user.id);
      expect(updated?.phone).to.eq(phone); // the payload is ignored
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

      expect(response).to.deep.eq(bad("invalid or missing phone number"));
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

  describe("POST /api/v1/confirmation-code/phone/verify", () => {
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

  describe("POST /api/v1/confirmation-code/password", () => {
    describe("/send", () => {
      it("should respond with bad in case the email is not provided", async () => {
        const res = await sendForgetPasswordCode({});
        expect(res).to.be.instanceof(ZodError);
      });

      it("should respond with notfound in case the user email not in the db", async () => {
        const res = await sendForgetPasswordCode({
          body: { email: "notfound@litespace.org" },
        });
        expect(res).to.deep.eq(notfound.user());
      });

      it("should create confirmation code and store it in the db", async () => {
        const student = await db.student();
        const res = await sendForgetPasswordCode({
          body: { email: student.email },
        });
        expect(res.status).to.eq(200);

        const inserted = await confirmationCodes.find({ userId: student.id });
        expect(inserted[0]).to.not.be.undefined;
      });

      it("should remove old confirmation code and override it", async () => {
        const student = await db.student();
        await sendForgetPasswordCode({
          body: { email: student.email },
        });
        const before = await confirmationCodes.find({ userId: student.id });

        const res = await sendForgetPasswordCode({
          body: { email: student.email },
        });
        expect(res.status).to.eq(200);

        const after = await confirmationCodes.find({ userId: student.id });
        expect(after).to.have.length(1);
        expect(after[0]).to.not.deep.eq(before[0]);
      });
    });

    describe("/confirm", () => {
      it("should respond with bad in case userId or code are not provided", async () => {
        const res = await confirmForgetPasswordCode({});
        expect(res).to.be.instanceof(ZodError);
      });

      it("should respond with invalidVerificationCode in case it's not in the db", async () => {
        const res = await confirmForgetPasswordCode({
          body: {
            password: "Password@8",
            code: 123321,
          },
        });
        expect(res).to.deep.eq(invalidVerificationCode());
      });

      it("should respond with expiredVerificationCode in case it's expired", async () => {
        const student = await db.student();

        // directly insert an expired code
        const { code } = await confirmationCodes.create({
          userId: student.id,
          purpose: IConfirmationCode.Purpose.ResetPassword,
          code: generateConfirmationCode(),
          expiresAt: dayjs.utc().subtract(5, "minutes").toISOString(),
        });

        const res = await confirmForgetPasswordCode({
          body: {
            password: "Password@8",
            code,
          },
        });
        expect(res).to.deep.eq(expiredVerificationCode());
      });

      it("should respond with a token in success and delete the code from the db", async () => {
        const student = await db.student();

        await sendForgetPasswordCode({
          body: { email: student.email },
        });

        // directly get the code from the database
        const { code } = (
          await confirmationCodes.find({ userId: student.id })
        )[0];

        const res = await confirmForgetPasswordCode({
          body: {
            password: "Password@8",
            code,
          },
        });

        expect(res).to.not.be.instanceof(Error);
      });
    });
  });

  describe("POST /api/v1/confirmation-code/email", () => {
    describe("/send", () => {
      it("should respond with forbidden in case it's not an auth user", async () => {
        const res = await sendEmailVerificationCode({});
        expect(res).to.deep.eq(forbidden());
      });

      it("should respond with emailAlreadyVerified in case the user email is already verified", async () => {
        const user = await db.user({ verifiedEmail: true });
        const res = await sendEmailVerificationCode({ user });
        expect(res).to.deep.eq(emailAlreadyVerified());
      });

      it("should respond with 200 in case every thing goes as expected", async () => {
        const user = await db.user();
        const res = await sendEmailVerificationCode({ user });
        expect(res).to.not.be.instanceof(Error);
        expect(res.status).to.eq(200);
      });
    });

    describe("/confirm", () => {
      it("should respond with forbidden in case it's not an auth user", async () => {
        const res = await confirmEmailVerificationCode({});
        expect(res).to.deep.eq(forbidden());
      });

      it("should respond with emailAlreadyVerified in case the user email is already verified", async () => {
        const user = await db.user({ verifiedEmail: true });
        const res = await confirmEmailVerificationCode({ user });
        expect(res).to.deep.eq(emailAlreadyVerified());
      });

      it("should respond with bad in case the code is not provided", async () => {
        const user = await db.user();
        const res = await confirmEmailVerificationCode({ user });
        expect(res).to.be.instanceof(ZodError);
      });

      it("should respond with invalidVerificationCode in case it's not in the db", async () => {
        const user = await db.user();
        const res1 = await confirmEmailVerificationCode({
          user,
          body: { code: 321123 },
        });
        expect(res1).to.deep.eq(invalidVerificationCode());

        await sendEmailVerificationCode({ user });
        const res2 = await confirmEmailVerificationCode({
          user,
          body: { code: 321123 },
        });
        expect(res2).to.deep.eq(invalidVerificationCode());
      });

      it("should respond with expiredVerificationCode in case it's expired", async () => {
        const user = await db.user();

        // directly insert an expired code
        const { code } = await confirmationCodes.create({
          userId: user.id,
          purpose: IConfirmationCode.Purpose.VerifyEmail,
          code: generateConfirmationCode(),
          expiresAt: dayjs.utc().subtract(5, "minutes").toISOString(),
        });

        const res = await confirmEmailVerificationCode({
          user,
          body: { code },
        });
        expect(res).to.deep.eq(expiredVerificationCode());
      });

      it("should successfully verify the user email", async () => {
        const user = await db.user();

        await sendEmailVerificationCode({ user });

        // directly get the code from the database
        const { code } = (await confirmationCodes.find({ userId: user.id }))[0];

        const res = await confirmEmailVerificationCode({
          user,
          body: { code },
        });

        expect(res).to.not.be.instanceof(Error);
        expect(res.status).to.eq(200);
      });
    });
  });
});
