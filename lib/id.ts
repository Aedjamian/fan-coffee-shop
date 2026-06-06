export function newId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${rand}-${Date.now().toString(36)}`;
}
