import { describe, expect, it } from "vitest";

import { withTimeout } from "./bootstrap";

describe("bootstrap timeout", () => {
  it("returns an operation that finishes inside the bound", async () => {
    await expect(withTimeout(Promise.resolve("ready"), 50)).resolves.toBe(
      "ready",
    );
  });

  it("rejects an operation that never settles", async () => {
    await expect(
      withTimeout(new Promise<never>(() => undefined), 5),
    ).rejects.toThrow("The operation took too long.");
  });
});
