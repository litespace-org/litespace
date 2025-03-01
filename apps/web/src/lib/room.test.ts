import { nameof } from "@litespace/utils/utils";
import { asOtherMember } from "@/lib/room";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import { expect } from "chai";

describe(nameof(asOtherMember), () => {
  const current = {
    id: 1,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    online: false,
    image: faker.image.urlPicsumPhotos(),
    createdAt: faker.date.past().toISOString(),
    gender: IUser.Gender.Male,
    updatedAt: faker.date.past().toISOString(),
    muted: false,
    pinned: false,
    role: IUser.Role.Student,
    roomId: 1,
  };

  const other = {
    id: 2,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    online: false,
    image: faker.image.urlPicsumPhotos(),
    createdAt: faker.date.past().toISOString(),
    gender: IUser.Gender.Female,
    updatedAt: faker.date.past().toISOString(),
    muted: false,
    pinned: false,
    role: IUser.Role.Student,
    roomId: 1,
  };

  it("should map room member to other member object", () => {
    expect(asOtherMember(current.id, [current, other])).to.be.deep.eq({
      id: other.id,
      name: other.name,
      image: other.image,
      online: other.online,
      role: other.role,
      gender: other.gender,
      lastSeen: other.updatedAt,
    });
  });

  it("should return null if another member is not found", () => {
    expect(asOtherMember(current.id, [current])).to.be.deep.eq(null);
  });
});
