import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { rooms } from "@/index";
import { expect } from "chai";

describe("Rooms", () => {
  beforeEach(async () => {
    await fixtures.flush();
  });

  describe(nameof(rooms.create), () => {
    it("should create a room", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();

      const created = await rooms.create([tutor.id, student.id]);
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
      const created = await fixtures.make.room([tutor.id, student.id]);
      const members = await rooms.findRoomMembers({ roomIds: [created] });

      expect(members).to.be.an("array").with.length(2);
      expect(members.map((m) => m.id)).to.be.deep.eq([tutor.id, student.id]);
    });
  });

  describe(nameof(rooms.findRoomByMembers), () => {
    it("should find the room by member ids", async () => {
      const t = await fixtures.tutor();
      const s = await fixtures.student();
      const created = await fixtures.make.room([t.id, s.id]);
      const room = await rooms.findRoomByMembers([t.id, s.id]);
      expect(room).to.be.eq(created);
    });
  });

  describe(nameof(rooms.findMemberRooms), () => {
    it("should find member rooms", async () => {
      const t = await fixtures.tutor();
      const s1 = await fixtures.student();
      const s2 = await fixtures.student();
      const s3 = await fixtures.student();
      const room1 = await fixtures.make.room([t.id, s1.id]);
      const room2 = await fixtures.make.room([t.id, s2.id]);
      const room3 = await fixtures.make.room([t.id, s3.id]);

      const memberRooms = await rooms.findMemberRooms({ userId: t.id });
      expect(memberRooms.list).to.be.an("array").with.length(3);
      expect(memberRooms.list.sort((a, b) => a - b)).to.be.deep.eq(
        [room1, room2, room3].sort((a, b) => a - b)
      );
    });
  });

  describe(nameof(rooms.update), () => {
    it("should update room settings per member", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const roomId = await fixtures.make.room([tutor.id, student.id]);

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
