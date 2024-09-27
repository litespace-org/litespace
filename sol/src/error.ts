export async function safe<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}
