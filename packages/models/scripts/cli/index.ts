import { Command } from "commander";
import { user } from "@cli/user";
import { lesson } from "@cli/lesson";

new Command("cli")
  .version("1.0.0")
  .description(
    "Command line interface for interacting with the database models"
  )
  .addCommand(user)
  .addCommand(lesson)
  .parse();
