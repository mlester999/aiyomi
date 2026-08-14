"use client";

import { useState, type FormEvent } from "react";

export function CsvExportForm({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitExport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const response = await fetch(form.action, {
        body: new FormData(form),
        credentials: "same-origin",
        method: "POST",
      });

      if (!response.ok || !response.headers.get("content-type")?.startsWith("text/csv")) {
        throw new Error("Export failed");
      }

      const filenameMatch = response.headers
        .get("content-disposition")
        ?.match(/filename="([A-Za-z0-9._-]+)"/);
      const blobUrl = window.URL.createObjectURL(await response.blob());
      const download = document.createElement("a");
      download.href = blobUrl;
      download.download = filenameMatch?.[1] ?? "aiyomi-waitlist.csv";
      document.body.append(download);
      download.click();
      download.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0);
    } catch {
      setError("The export could not be downloaded. Check your access and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      action="/api/export/waitlist"
      className="csv-export-form"
      method="post"
      onSubmit={submitExport}
    >
      {Object.entries(params).map(([key, value]) =>
        value ? <input key={key} name={key} type="hidden" value={value} /> : null,
      )}
      <button
        aria-describedby={error ? "csv-export-error" : undefined}
        className="button button-secondary"
        disabled={pending}
        type="submit"
      >
        {pending ? "Preparing export…" : "Export filtered CSV"}
      </button>
      {error && (
        <span className="csv-export-error" id="csv-export-error" role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
