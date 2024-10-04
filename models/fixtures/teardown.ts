import { down } from "./shared";

export default async function teardown() {
  await down();
}
