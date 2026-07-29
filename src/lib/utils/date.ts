export function formatDate(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(
    "en-US",
    options ?? { month: "short", day: "numeric", year: "numeric" },
  ).format(date);
}

export function isOverdue(value?: string | null) {
  if (!value) return false;
  const due = new Date(`${value.slice(0, 10)}T23:59:59`);
  return due.getTime() < Date.now();
}

export function initials(name?: string | null) {
  return (
    (name ?? "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}
