import axios from "axios";
import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";

type Project = {
  id: string;
  name: string;
  accountId: string;
  createdAt: string;
  framework: string;
  devCommand: string | null;
  installCommand: string | null;
  buildCommand: string | null;
  outputDirectory: string | null;
  rootDirectory: string | null;
  directoryListing: string | null;
  nodeVersion: string | null;
};

async function safe<T>(callback: () => Promise<T>): Promise<T | Error> {
  try {
    return await callback();
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      return new Error(message);
    }
    if (error instanceof Error) return error;
    throw new Error("Unkown error type");
  }
}

const client = axios.create({
  baseURL: "https://api.vercel.com",
  headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
});

async function findProject(name: string): Promise<Project> {
  return await client
    .get<Project>(`/v9/projects/${name}`)
    .then((response) => response.data);
}

async function createProject({
  name,
  buildCommand = "yarn build",
  outputDirectory = "dist",
  installCommand = "yarn",
}: {
  name: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
}): Promise<Project> {
  const { data } = await client.post<Project>("/v10/projects", {
    name,
    buildCommand,
    installCommand,
    outputDirectory,
    framework: "vite",
  });

  return data;
}

function asVercelDirectory(workspace: string) {
  return path.join(workspace, ".vercel");
}

function saveProject(vercel: string, project: Project) {
  const data = {
    projectId: project.id,
    orgId: project.accountId,
    settings: {
      createdAt: project.createdAt,
      framework: project.framework,
      devCommand: project.devCommand,
      installCommand: project.installCommand,
      buildCommand: project.buildCommand,
      outputDirectory: project.outputDirectory,
      rootDirectory: project.rootDirectory,
      directoryListing: project.directoryListing,
      nodeVersion: project.nodeVersion,
    },
  } as const;

  const file = path.join(vercel, "project.json");
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const create = new Command()
  .name("create")
  .argument("<name>", "Project name")
  .option("-b, --build <build-command>", "Project build command")
  .option("-i, --install <install-command>", "Project install command")
  .option("-o, --output <output-directory>", "Project output directory")
  .action(
    async (
      name: string,
      options: { build?: string; install?: string; output?: string }
    ) => {
      const project = await safe(() =>
        createProject({
          name,
          buildCommand: options.build,
          installCommand: options.install,
          outputDirectory: options.output,
        })
      );

      if (project instanceof Error) throw project;
      console.log(`Project (${project.name}) created successfully`);
    }
  );

const pull = new Command()
  .name("pull")
  .argument("<name>", "Project name")
  .argument("<path>", "Where to save project info after pulling it from vercel")
  .action(async (name: string, path: string) => {
    if (!fs.existsSync(path)) throw new Error(`"${path}" not found`);

    const vercel = asVercelDirectory(path);
    if (fs.existsSync(vercel))
      fs.rmSync(vercel, { recursive: true, force: true });

    fs.mkdirSync(vercel);

    const project = await safe(() => findProject(name));
    if (project instanceof Error) throw project;

    saveProject(vercel, project);
  });

new Command()
  .name("vercel")
  .description("Manage Vercel deployments.")
  .version("1.0.0")
  .addCommand(create)
  .addCommand(pull)
  .parse();
