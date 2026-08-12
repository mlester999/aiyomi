export class OperationTimedOutError extends Error {
  constructor() {
    super("External operation timed out.");
    this.name = "OperationTimedOutError";
  }
}

export const withTimeout = async <Result>(
  operation: Promise<Result>,
  timeoutMs: number,
): Promise<Result> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new OperationTimedOutError()), timeoutMs);
  });

  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};
