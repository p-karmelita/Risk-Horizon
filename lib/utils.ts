export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatRiskTone(level: string) {
  if (level === "High") return "danger";
  if (level === "Medium") return "warning";
  if (level === "Low") return "complete";
  return "idle";
}
