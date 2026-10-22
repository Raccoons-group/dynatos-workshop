// The workshop runs in 's-Hertogenbosch, so every time on a slide is local time there, whatever the laptop says.
export const WORKSHOP_TIME_ZONE = "Europe/Amsterdam";

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WORKSHOP_TIME_ZONE,
});

export function hhmm(iso: string | null | undefined): string {
  return iso ? clock.format(new Date(iso)) : "";
}

// group-a → Group A, demo → Demo.
export function groupLabel(group: string): string {
  const name = group.replace(/^group-/, "");
  return group.startsWith("group-")
    ? `Group ${name.toUpperCase()}`
    : name.charAt(0).toUpperCase() + name.slice(1);
}

export const DEMO_GROUP = "demo";
