const body = process.argv[2];
if (!body) throw new Error("Release body is missing.");

const regex = body.match(/```release\n(?<workspaces>[A-Za-z@/,]*)\n```/);

const raw = regex?.groups?.["workspaces"];
if (!raw) throw new Error("Invalid release body; Workspaces is not recognized");

if (raw === "skip") {
  console.log("skip");
  process.exit(0);
}

const expected = [
  "@litespace/web",
  "@litespace/dashboard",
  "@litespace/blog",
  "@litespace/landing",
  "@litespace/server",
];

const workspaces = raw.split(",");

for (const workspace of workspaces) {
  if (!expected.includes(workspace))
    throw new Error(
      `${workspace} is not a valid workspace name. Expecting one of${expected.join(",")}`
    );
}

console.log(raw);
