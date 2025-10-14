import { Client4 } from "@mattermost/client";
import { config } from "@/lib/config";

export const mattermost = new Client4();

mattermost.setUrl("https://chat.litespace.org");
mattermost.setToken(config.mattermost.token);
