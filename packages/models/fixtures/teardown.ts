// eslint-disable-next-line no-restricted-imports
import { down } from "./shared";

export default async function teardown() {
  await down();
}
