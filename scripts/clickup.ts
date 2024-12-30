import axios from "axios";
import { Command } from "commander";

type Assignee = {
  id: number;
  username: string;
};

type Task = {
  id: string;
  name: string;
  list: { id: string; name: string };
  assignees: Assignee[];
  subtasks?: Array<{ id: string; assignees: Assignee[] }>;
};

/**
 * Map from GitHub username to ClickUp user id.
 */
const teamMap = {
  neuodev: 87694669,
  mostafakamar2308: 81896187,
  moalidv: 152456419,
  mmoehabb: 3513699,
} as const;

const client = axios.create({
  baseURL: "https://api.clickup.com/api/v2/",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: process.env.CLICKUP_API_TOKEN,
  },
});

async function getTask(id: string): Promise<Task> {
  const { data } = await client.get(`/task/${id}`, {
    params: { include_subtasks: true },
  });
  return data;
}

async function createSubtask({
  name,
  description,
  parentTaskId,
  userId,
  listId,
}: {
  name: string;
  description: string;
  parentTaskId: string;
  userId: number;
  listId: string;
}) {
  await client.post(`/list/${listId}/task`, {
    parent: parentTaskId,
    assignees: [userId],
    markdown_content: description,
    name,
  });
}

function getClickupTaskId(pullRequestDescription: string) {
  const CLICKUP_TASK_URL = /https:\/\/app.clickup.com\/t\/([a-zA-Z0-9]*)/gi;
  const match: string[] | null = pullRequestDescription.match(CLICKUP_TASK_URL);
  if (!match) return [];
  return match.map((match) => match.replace("https://app.clickup.com/t/", ""));
}

const createReviewTasks = new Command()
  .requiredOption("-t, --title <VALUE>", "Pull request title")
  .requiredOption("-d, --description <VALUE>", "Pull request description")
  .requiredOption("-n, --number <VALUE>", "Pull request number")
  .name("pr-review-tasks")
  .action(
    async ({
      title,
      description,
      number,
    }: {
      title: string;
      description: string;
      number: string;
    }) => {
      const ids = getClickupTaskId(description);

      for (const id of ids) {
        const task = await getTask(id);
        const teamIds = Object.values(teamMap);
        const assignees = task.assignees.map((assignee) => assignee.id);
        const subtaskAssignees = task.subtasks
          ? task.subtasks?.reduce<number[]>((assignees, task) => {
              return assignees.concat(
                task.assignees.map((assignee) => assignee.id)
              );
            }, [])
          : [];
        const reviewers = teamIds.filter(
          (id) => !assignees.includes(id) && !subtaskAssignees.includes(id)
        );

        for (const reviewer of reviewers) {
          await createSubtask({
            name: `[AUTO] Review ${title}`,
            description: `Pull request [#${number}](https://github.com/litespace-org/litespace/pull/${number})`,
            listId: task.list.id,
            parentTaskId: task.id,
            userId: reviewer,
          });
        }
      }
    }
  );

new Command()
  .name("clickup")
  .description("ClickUp automation script")
  .version("1.0.0", "-v")
  .addCommand(createReviewTasks)
  .parse();
