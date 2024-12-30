import { warn, danger } from "danger";

const CLICKUP_TASK_URL = /https:\/\/app.clickup.com\/t\/([a-zA-Z0-9]*)/gi;

const pullRequestDescription = danger.github.pr.body;

function getClickupTask() {
  const urls: string[] | null = pullRequestDescription.match(CLICKUP_TASK_URL);
  if (!urls) return warn("No clickup task found in this pull request");
}

getClickupTask();
