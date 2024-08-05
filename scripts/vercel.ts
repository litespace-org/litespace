import axios from "axios";
import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";

type Framework = "vite" | "nextjs";

type Project = {
  id: string;
  name: string;
  accountId: string;
  createdAt: string;
  framework: Framework;
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

function client(token?: string) {
  return axios.create({
    baseURL: "https://api.vercel.com",
    headers: { Authorization: `Bearer ${token || process.env.VERCEL_TOKEN}` },
  });
}

async function findProject(name: string, token?: string): Promise<Project> {
  return await client(token)
    .get<Project>(`/v9/projects/${name}`)
    .then((response) => response.data);
}

async function createProject({
  name,
  framework = "vite",
  buildCommand = "yarn build",
  outputDirectory = "dist",
  installCommand = "yarn",
  token,
}: {
  name: string;
  framework?: Framework;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  token?: string;
}): Promise<Project> {
  const { data } = await client(token).post<Project>("/v10/projects", {
    name,
    framework,
    buildCommand,
    installCommand,
    outputDirectory,
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
  .option("-f, --framework <framework>", "Project framework")
  .action(
    async (
      name: string,
      options: {
        build?: string;
        install?: string;
        output?: string;
        framework: Framework;
      }
    ) => {
      const project = await safe(() =>
        createProject({
          name,
          buildCommand: options.build,
          framework: options.framework,
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
  .option("-t, --token <token>", "Vercel token")
  .action(async (name: string, path: string, options: { token?: string }) => {
    if (!fs.existsSync(path)) throw new Error(`"${path}" not found`);

    const vercel = asVercelDirectory(path);
    if (fs.existsSync(vercel))
      fs.rmSync(vercel, { recursive: true, force: true });

    fs.mkdirSync(vercel);

    const project = await safe(() => findProject(name, options.token));
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
