const FORMULA_PREFIX = /^\s*[=+\-@]/;

export const sanitizeCsvCell = (value: unknown) => {
  const plain = value === null || value === undefined ? "" : String(value);
  const safe = FORMULA_PREFIX.test(plain) ? `'${plain}` : plain;
  return `"${safe.replaceAll('"', '""')}"`;
};

export const createCsv = (
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<unknown>>,
) =>
  [headers, ...rows]
    .map((row) => row.map(sanitizeCsvCell).join(","))
    .join("\r\n") + "\r\n";
