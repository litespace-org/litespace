import { up, down } from "@fixtures/shared";

export default async function setup() {
  await down();
  await up();
}
