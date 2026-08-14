import { describe, expect, it } from "vitest";

import { createCsv, sanitizeCsvCell } from "../lib/admin/csv";

describe("safe CSV creation", () => {
  it("quotes commas, quotes, and line breaks", () => {
    expect(sanitizeCsvCell('Ada, "A"\nLovelace')).toBe(
      '"Ada, ""A""\nLovelace"',
    );
  });

  it.each([
    "=1+1",
    "+cmd",
    "-2+3",
    "@SUM(A1:A2)",
    "  =1+1",
    "\t@SUM(A1:A2)",
  ])(
    "neutralizes formula-like cell %s",
    (value) => {
      expect(sanitizeCsvCell(value)).toBe(`"'${value}"`);
    },
  );

  it("writes a stable CRLF-delimited document", () => {
    expect(createCsv(["email"], [["person@example.com"]])).toBe(
      '"email"\r\n"person@example.com"\r\n',
    );
  });
});
