import { CanonicalIntent, INTENT_ALIASES } from "./intentAliases";

export function normalizeFineIntent(raw?: string | any): string | any {
  if (!raw) return null;

  return raw
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
}

export function resolveCanonicalIntent(
  fineIntent?: string | null,
): CanonicalIntent {
  if (!fineIntent) return "UNKNOWN";

  const normalized = normalizeFineIntent(fineIntent);
  for (const [canonical, aliases] of Object.entries(INTENT_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical as CanonicalIntent;
    }
  }

  return "UNKNOWN";
}
