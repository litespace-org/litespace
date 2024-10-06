import { down, up } from "./shared";

export default async function setup() {
  await down();
  await up();
}
