import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { knex, rooms } from "@/index";
import { expect } from "chai";
import { IUser } from "@litespace/types";

describe("Rooms", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(rooms.create), () => {
    it("should create a room", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();

      const created = await knex.transaction(async (tx) =>
        rooms.create([tutor.id, student.id], tx)
      );
      expect(created).to.be.a("number");

      const room = await rooms.findById(created);
      expect(room).to.exist;
      expect(room!.id).to.be.eq(created);
    });
  });

  describe(nameof(rooms.findRoomMembers), () => {
    it("should find room members", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const created = await fixtures.room([tutor.id, student.id]);
      const members = await rooms.findRoomMembers({ roomIds: [created] });

      expect(members).to.be.an("array").with.length(2);
      expect(members.map((m) => m.id)).to.be.deep.eq([tutor.id, student.id]);
    });
  });

  describe(nameof(rooms.findRoomByMembers), () => {
    it("should find the room by member ids", async () => {
      const t = await fixtures.tutor();
      const s = await fixtures.student();
      const created = await fixtures.room([t.id, s.id]);
      const room = await rooms.findRoomByMembers([t.id, s.id]);
      expect(room).to.be.eq(created);
    });
  });

  describe(nameof(rooms.findMemberRooms), () => {
    it("should find member rooms", async () => {
      const tutor = await fixtures.tutor();
      const s1 = await fixtures.student();
      const s2 = await fixtures.student();
      const s3 = await fixtures.student();

      const tutorId = tutor.id;
      const mockRooms = [
        await fixtures.room([tutorId, s1.id]),
        await fixtures.room([tutorId, s2.id]),
        await fixtures.room([tutorId, s3.id]),
      ];

      const memberRooms = await rooms.findMemberRooms({ userId: tutorId });
      expect(memberRooms.list).to.be.an("array").with.length(3);
      expect(memberRooms.list).to.be.contain.members(mockRooms);
    });

    it("should be able to filter rooms by the `pinned` and `muted` flags", async () => {
      const tutor = await fixtures.tutor();
      const s1 = await fixtures.student();
      const s2 = await fixtures.student();
      const s3 = await fixtures.student();
      const tutorId = tutor.id;
      const mockRooms = [
        await fixtures.room([tutorId, s1.id]),
        await fixtures.room([tutorId, s2.id]),
        await fixtures.room([tutorId, s3.id]),
      ];

      await rooms.update({
        userId: tutorId,
        payload: { pinned: true, muted: true },
        roomId: mockRooms[0],
      });

      await rooms.update({
        userId: tutorId,
        payload: { muted: true },
        roomId: mockRooms[1],
      });

      const tests = [
        {
          pinned: true,
          list: [mockRooms[0]],
        },
        {
          muted: true,
          list: [mockRooms[1], mockRooms[0]],
        },
        {
          pinned: true,
          muted: true,
          list: [mockRooms[0]],
        },
        {
          pinned: false,
          muted: false,
          list: [mockRooms[2]],
        },
        {
          pinned: true,
          muted: false,
          list: [],
        },
      ];

      for (const test of tests) {
        const res = await rooms.findMemberRooms({
          userId: tutorId,
          pinned: test.pinned,
          muted: test.muted,
        });
        expect(res.list).to.be.contain.members(test.list);
      }
    });

    it("should filter user rooms by search keyword", async () => {
      const tutor = await fixtures.user({
        role: IUser.Role.Tutor,
        name: "tutor",
      });

      for (const name of ["student-1", "student-2", "student-3"]) {
        const student = await fixtures.user({
          role: IUser.Role.Student,
          name,
        });

        const room = await fixtures.room([tutor.id, student.id]);

        await fixtures.message({
          userId: tutor.id,
          roomId: room,
          text: `Hello, ${student.name}`,
        });
      }

      const tests = [
        {
          keyword: "student-1",
          total: 1,
        },
        {
          keyword: "student",
          total: 3,
        },
        {
          keyword: "Hello, ",
          total: 3,
        },
        {
          keyword: "Hello, student-1",
          total: 1,
        },
        {
          keyword: "student-3",
          total: 1,
        },
      ];

      for (const test of tests) {
        const res = await rooms.findMemberRooms({
          userId: tutor.id,
          keyword: test.keyword,
          size: 50,
        });
        expect(res.total).to.be.eq(test.total);
      }
    });
  });

  describe(nameof(rooms.update), () => {
    it("should update room settings per member", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const roomId = await fixtures.room([tutor.id, student.id]);

      const [tutorCurrentRoom, studentCurrentRoom] =
        await rooms.findRoomMembers({
          roomIds: [roomId],
        });

      expect(tutorCurrentRoom.muted).to.be.false;
      expect(tutorCurrentRoom.pinned).to.be.false;
      expect(studentCurrentRoom.muted).to.be.false;
      expect(studentCurrentRoom.pinned).to.be.false;

      const tutorUpdatedRoom = await rooms.update({
        userId: tutor.id,
        roomId: roomId,
        payload: { pinned: true, muted: true },
      });
      expect(tutorUpdatedRoom.muted).to.be.true;
      expect(tutorUpdatedRoom.pinned).to.be.true;

      const studentdUpdatedRoom = await rooms.update({
        userId: student.id,
        roomId: roomId,
        payload: { pinned: true, muted: true },
      });
      expect(studentdUpdatedRoom.pinned).to.be.true;
      expect(studentdUpdatedRoom.muted).to.be.true;
    });
  });
});
