/**
 * Injects a JSON-LD structured-data block. Server-rendered into the page so
 * crawlers read it on first fetch. `data` is any schema.org object graph.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own static data (no user input), so this
      // is safe; JSON.stringify also escapes it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
