export function buildCacheKey(namespace: string, id: string): string {
  return `${namespace}:${id}`;
}
