// Example projects - loaded from GET /api/examples.

let _cache = null;

/**
 * Load all example circuits.
 * Returns a Promise<Array<{id, name, description, state}>>.
 * Result is cached so multiple callers share one set of requests.
 */
export async function loadExamples() {
  if (_cache) return _cache;
  try {
    const res = await fetch('/api/examples');
    if (!res.ok) return [];
    _cache = await res.json();
    return _cache;
  } catch {
    return [];
  }
}
