export function isCanceledInterview(
  canceledBy: number | null,
  userId?: number
): "canceled-by-you" | "canceled-by-tutor-manager" | undefined {
  if (!canceledBy) return undefined;

  if (canceledBy === userId) return "canceled-by-you";

  return "canceled-by-tutor-manager";
}
