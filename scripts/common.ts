import { capitalize } from "lodash";

export type Update = {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name: string;
    };
    chat: {
      id: number;
      title: string;
      type: string;
    };
    text?: string;
    date?: number;
  };
};

export type VercelUrls = Record<string, string | null>;

export function asVercelUrl(url: string | null) {
  if (!url) return "-";
  return `https://${url}`;
}

export function asVercelUrlsMessage(
  urls: VercelUrls,
  prefix: string = ""
): string {
  let message = prefix + "\n";

  for (const [name, url] of Object.entries(urls)) {
    message += `🚀 ${capitalize(name)}: ${asVercelUrl(url)}\n`;
  }

  return message;
}
