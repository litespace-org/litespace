import { faker } from "@faker-js/faker/locale/ar";

export function imageUrl() {
  return faker.image.urlPicsumPhotos({ width: 1200, height: 1200 });
}

export { faker };
