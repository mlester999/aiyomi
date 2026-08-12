import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationTimedOutError, withTimeout } from "./promise-timeout";

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an operation result before the deadline", async () => {
    await expect(withTimeout(Promise.resolve("ready"), 100)).resolves.toBe(
      "ready",
    );
  });

  it("rejects a provider operation that exceeds the deadline", async () => {
    vi.useFakeTimers();
    const pending = new Promise<never>(() => undefined);
    const result = withTimeout(pending, 1_000);
    const expectation = expect(result).rejects.toBeInstanceOf(
      OperationTimedOutError,
    );

    await vi.advanceTimersByTimeAsync(1_000);
    await expectation;
  });
});
