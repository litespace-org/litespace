export type PossibleError<T> = Error | T;

export async function safe<T>(
  callback: () => Promise<T>
): Promise<PossibleError<T>> {
  try {
    return await callback();
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("unexpected error occurred");
  }
}

export function isPermissionDenied(error: Error): boolean {
  return (
    error.name === "NotAllowedError" &&
    error.message === "Permission denied" &&
    "code" in error &&
    error.code === 0
  );
}
