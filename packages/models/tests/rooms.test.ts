import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { rooms } from "@/index";
import { expect } from "chai";
import { IUser } from "@litespace/types";

describe("Rooms", () => {
  beforeAll(async () => {
    await fixtures.flush();
  });
  beforeEach(async () => {
    await fixtures.flush();
  });

  afterEach(async () => {
    await fixtures.flush();
  });

  describe(nameof(rooms.create), () => {
    it("should create a room", async () => {
      const t = await fixtures.user(IUser.Role.Tutor);
      const s = await fixtures.user(IUser.Role.Student);

      const created = await rooms.create([t.id, s.id]);
      expect(created).to.be.a("number");

      const room = await rooms.findById(created);
      expect(room).to.exist;
      expect(room!.id).to.be.eq(created);
    });
  });

  describe(nameof(rooms.findRoomMembers), () => {
    it("should find room members", async () => {
      const t = await fixtures.user(IUser.Role.Tutor);
      const s = await fixtures.user(IUser.Role.Student);
      const created = await fixtures.make.room([t.id, s.id]);

      const members = await rooms.findRoomMembers({ roomIds: [created] });

      expect(members).to.be.an("array").with.length(2);
      expect(members.map((m) => m.id).sort((a, b) => a - b)).to.be.deep.eq(
        [t.id, s.id].sort((a, b) => a - b)
      );
    });
  });

  describe(nameof(rooms.findRoomByMembers), () => {
    it("should find the room by member ids", async () => {
      const t = await fixtures.user(IUser.Role.Tutor);
      const s = await fixtures.user(IUser.Role.Student);
      const created = await fixtures.make.room([t.id, s.id]);

      const room = await rooms.findRoomByMembers([t.id, s.id]);
      expect(room).to.be.eq(created);
    });
  });

  describe(nameof(rooms.findMemberRooms), () => {
    it("should find every room of a member", async () => {
      const t = await fixtures.user(IUser.Role.Tutor);
      const s1 = await fixtures.user(IUser.Role.Student);
      const s2 = await fixtures.user(IUser.Role.Student);
      const s3 = await fixtures.user(IUser.Role.Student);
      const room1 = await fixtures.make.room([t.id, s1.id]);
      const room2 = await fixtures.make.room([t.id, s2.id]);
      const room3 = await fixtures.make.room([t.id, s3.id]);

      const memberRooms = await rooms.findMemberRooms({ userId: t.id });
      expect(memberRooms.list).to.be.an("array").with.length(3);
      expect(memberRooms.list.sort((a, b) => a - b)).to.be.deep.eq(
        [room1, room2, room3].sort((a, b) => a - b)
      );
    });

    describe(nameof(rooms.update), () => {
      it("should update room settings", async () => {
        const t = await fixtures.user(IUser.Role.Tutor);
        const s = await fixtures.user(IUser.Role.Student);
        const created = await fixtures.make.room([t.id, s.id]);

        const tUpdated = await rooms.update(t.id, created, { muted: true });
        expect(tUpdated.muted).to.be.true;
        const sUpdated = await rooms.update(s.id, created, { pinned: true });
        expect(sUpdated.pinned).to.be.true;
      });
    });
  });
});
