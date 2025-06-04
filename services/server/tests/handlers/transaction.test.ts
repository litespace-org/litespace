import handlers from "@/handlers/transaction";
import { ITransaction, IUser } from "@litespace/types";
import { expect } from "chai";
import { forbidden, notfound } from "@/lib/error";
import { fixtures as db, mockApi } from "@litespace/tests";

const find = mockApi<ITransaction.FindQueryApi>(handlers.find);
const findById = mockApi<object, { id: number }, object>(handlers.findById);

describe("/api/v1/tx/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/tx/:id", () => {
    it("should respond with forbidden in case the user is neither an admin nor a student", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await findById({
        user: tutor,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the student is trying to retrieve another transaction that he doen't own", async () => {
      const s1 = await db.user({ role: IUser.Role.Student });
      const s2 = await db.user({ role: IUser.Role.Student });

      const tx = await db.transaction({ userId: s1.id });

      const res = await findById({
        user: s2,
        params: { id: tx.id },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the transaction is not found.", async () => {
      const student = await db.user({ role: IUser.Role.Student });

      const res = await findById({
        user: student,
        params: { id: 300 },
      });

      expect(res).to.deep.eq(notfound.transaction());
    });

    it("should successfully respond with the transaction by providing its id", async () => {
      const s1 = await db.user({ role: IUser.Role.Student });
      const tx = await db.transaction({ userId: s1.id });

      const res = await findById({
        user: s1,
        params: { id: tx.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq(tx);
    });
  });

  describe("GET /api/v1/tx/list", () => {
    it("should respond with forbidden in case the user is neither an admin nor a student", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });

      const res = await find({
        user: tutor,
        body: {
          users: [tutor.id],
        },
      });
      expect(res).to.deep.eq(forbidden());
    });
  });
});
