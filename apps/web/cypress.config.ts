import { defineConfig } from "cypress";
import { hashPassword, users } from "@litespace/models";
import { exec } from "node:child_process";
import { safePromise } from "@litespace/utils/cjs";
import { TasksParamsMap, TasksResultMap } from "@cy/support/commands";
import { IUser } from "@litespace/types";
import tests from "@litespace/tests/cjs";

async function execute(command: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stdout);
      return resolve(stdout);
    });
  });
}

const tasks: {
  [K in keyof TasksParamsMap]: (
    payload: TasksParamsMap[K]
  ) => Promise<TasksResultMap[K]>;
} = {
  "users:find": users.find,
  "users:create": async (payload: IUser.CreatePayload) =>
    await users.create({
      ...payload,
      password: payload.password ? hashPassword(payload.password) : undefined,
    }),
  "db:flush": async () => {
    await tests.db.flush();
    return null;
  },
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on("before:run", async () => {
        console.log("setup...");
        await safePromise(execute("pnpm -w models migrate:test:local down 0"));
        await safePromise(execute("pnpm -w models migrate:test:local up"));
      });

      on("after:run", async () => {
        console.log("teardown...");
        await safePromise(execute("pnpm -w models migrate:test:local down 0"));
      });

      on("task", tasks);
    },
    baseUrl: "http://localhost:3000",
    viewportWidth: 1920,
    viewportHeight: 1080,
    testIsolation: true,
    screenshotOnRunFailure: true,
  },
});
