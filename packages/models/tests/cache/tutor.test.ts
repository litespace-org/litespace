import { cache } from "@fixtures/cache";
import { faker } from "@faker-js/faker/locale/ar";
import { IUser } from "@litespace/types";
import { expect } from "chai";
import { sample } from "lodash";

const getMockTutorCache = (id: number) => ({
  id,
  name: faker.word.noun(),
  image: faker.internet.url(),
  video: faker.internet.url(),
  email: faker.internet.email(),
  city: faker.number.int({ min: 1, max: 15 }),
  phoneNumber: faker.string.numeric({ length: 11 }),
  bio: faker.lorem.words(30),
  about: faker.lorem.sentence(5),
  gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
  notice: faker.number.int(),
  topics: faker.lorem.words(5).split(" "),
  avgRating: faker.number.float(),
  studentCount: faker.number.int(),
  lessonCount: faker.number.int(),
});

describe("Testing cache/tutors functions", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await cache.flush();
  });

  it("should set/retreive one tutor in/from the cache", async () => {
    const mockData = getMockTutorCache(1);
    await cache.tutors.setOne(mockData);
    const res = await cache.tutors.getOne(1);
    expect(res).to.deep.eq(mockData);
  });

  it("should set/retreive many tutors in/from the cache", async () => {
    const tutor1 = getMockTutorCache(1);
    const tutor2 = getMockTutorCache(2);

    await cache.tutors.setMany([tutor1, tutor2]);

    const res = await cache.tutors.getAll();
    expect(res).to.have.length(2);
    expect(res).to.deep.contains(tutor1);
    expect(res).to.deep.contains(tutor2);
  });

  it("should check if tutors key exists in the cache or not", async () => {
    const res1 = await cache.tutors.exists();
    expect(res1).to.false;

    const mockData = getMockTutorCache(1);
    await cache.tutors.setOne(mockData);

    const res2 = await cache.tutors.exists();
    expect(res2).to.true;
  });
});
