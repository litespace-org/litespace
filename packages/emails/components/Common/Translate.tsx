import areg from "@/locales/ar-eg.json";
import { concat } from "lodash";
import { Text } from "@react-email/components";
import React from "react";

type MessageId = keyof typeof areg;

const base = (id: MessageId, labels: Record<string, React.ReactNode> = {}) => {
  const chunks: React.ReactNode[] = [];
  let message = areg[id];

  for (const key of Object.keys(labels)) {
    const id = `{${key}}`;
    if (!message.includes(id)) continue;
    const [prev, next] = message.split(id);
    chunks.push(
      <Text key={prev} className="inline">
        {prev}
      </Text>,
      labels[key]
    );
    message = next;
  }

  return concat(chunks, message);
};

export const translate = Object.assign(base, {
  string: (id: MessageId, labels?: Record<string, string | number>) => {
    const value = areg[id];
    if (!labels) return value;

    return Object.entries(labels).reduce((message: string, [key, value]) => {
      const id = `{${key}}`;
      if (!message.includes(id)) return message;
      return message.replace(id, value.toString());
    }, value);
  },
});
