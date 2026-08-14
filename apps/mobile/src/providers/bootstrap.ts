export const BOOTSTRAP_TIMEOUT_MS = 12_000;
export const PROFILE_REQUEST_TIMEOUT_MS = 10_000;

export const withTimeout = async <Value>(
  operation: Promise<Value>,
  timeoutMs: number,
): Promise<Value> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error("The operation took too long.")),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([operation, expired]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};
