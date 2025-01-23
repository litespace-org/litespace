import areg from "@/locales/ar-eg.json";

type MessageId = keyof typeof areg;

export function translate(
  id: MessageId,
  labels?: Record<string, string | number>
) {
  const value = areg[id];
  if (!labels) return value;

  return Object.entries(labels).reduce((message: string, [key, value]) => {
    const id = `{${key}}`;
    if (!message.includes(id)) return message;
    return message.replace(id, value.toString());
  }, value);
}
