import { Command } from "commander";
import { flush, interview } from "@fixtures/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { range } from "lodash";
import { interviews } from "@/interviews";

dayjs.extend(utc);

const create = new Command("create")
  .description("Create 100 interviews for the next 100 hours")
  .action(async () => {
    try {
      await flush();

      // Create 100 interviews for the next 100 hours
      for (const idx of range(1, 101)) {
        await interview({
          start: dayjs.utc().add(idx, "h").toISOString(),
        });
      }

      const { list } = await interviews.find({ full: true });
      console.log({ list });
      console.log("Created 100 interviews");
      process.exit(0);
    } catch (error) {
      console.error("Error creating interviews:", error);
      process.exit(1);
    }
  });

const Interview = new Command("interview").addCommand(create);

export default Interview;
