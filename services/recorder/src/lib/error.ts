export async function safe<T>(callback: () => Promise<T>): Promise<T | Error> {
  try {
    return await callback();
  } catch (error) {
    return error instanceof Error ? error : new Error("failed to execute");
  }
}
