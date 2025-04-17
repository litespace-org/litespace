import db from "@fixtures/db";
import handlers from "@/handlers/transaction";
import { ITransaction, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { bad, forbidden, notfound } from "@/lib/error";
import dayjs from "dayjs";

const find = mockApi<ITransaction.FindQuery>(handlers.find);
const findById = mockApi<object, { id: number }, object>(handlers.findById);

describe("/api/v1/tx/", () => {
  var admin: IUser.Self;
  var tutor1: IUser.Self;
  var tutor2: IUser.Self;

  var txs1: ITransaction.Self[];
  var txs2: ITransaction.Self[];

  beforeAll(async () => {
    await db.flush();

    admin = await db.user({ role: IUser.Role.SuperAdmin });

    tutor1 = await db.user({ role: IUser.Role.Tutor });
    tutor2 = await db.user({ role: IUser.Role.Tutor });

    txs1 = await Promise.all([
      db.transaction({ userId: tutor1.id }),
      db.transaction({ userId: tutor1.id }),
      db.transaction({ userId: tutor1.id }),
      db.transaction({ userId: tutor1.id }),
    ]);

    txs2 = await Promise.all([
      db.transaction({ userId: tutor2.id }),
      db.transaction({ userId: tutor2.id }),
      db.transaction({ userId: tutor2.id }),
    ]);
  });

  describe("GET /api/v1/tx/:id", () => {
    it("should respond with forbidden in case the requester is neither an admin nor a tutor.", async () => {
      const student = await db.student();
      const res = await findById({
        user: student,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the tutor is trying to retrieve another tutor transaction.", async () => {
      const res = await findById({
        user: tutor1,
        params: { id: txs2[0].id },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the transaction is not found.", async () => {
      const res = await findById({
        user: tutor1,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(notfound.transaction());
    });

    it("should successfully respond with the transaction object.", async () => {
      const res = await findById<ITransaction.Self>({
        user: tutor1,
        params: { id: txs1[0].id },
      });
      expect(res).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq(txs1[0]);
    });
  });

  describe("GET /api/v1/tx/list", () => {
    it("should respond with forbidden in case the requester is neither an admin nor a tutor.", async () => {
      const student = await db.student();
      const res = await find({
        user: student,
        body: {
          users: [student.id],
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the tutor is trying to retrieve another tutors transactions.", async () => {
      const res = await find({
        user: tutor1,
        body: {
          users: [tutor2.id],
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with bad in case the tutor is trying to retrieve transactions without specifying the users list.", async () => {
      const res = await find({
        user: tutor1,
        body: {
          after: dayjs().utc().toISOString(),
        },
      });
      expect(res).to.deep.eq(bad());
    });

    it("should successfully respond with a list of the transactions.", async () => {
      const res = await find<ITransaction.FindApiResponse>({
        user: tutor1,
        body: {
          users: [tutor1.id],
        },
      });
      expect(res.body?.total).to.eq(4);
      expect(res.body?.list).to.deep.eq(txs1);
    });
  });
});
