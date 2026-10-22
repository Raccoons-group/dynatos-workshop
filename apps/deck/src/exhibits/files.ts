// The repo files the exhibits show. Vite reads them at build time and hot-reloads them in dev, so an exhibit
// always shows the file as it is in this checkout, never a copy pasted into a slide.

const files = import.meta.glob<string>(
  [
    "../../../../AGENTS.md",
    "../../../../docs/agents-md-template.md",
    "../../../../.github/workflows/guard.yml",
    "../../../../.scratch/workshop/map.md",
    "../../../../.scratch/workshop/GLOSSARY.md",
    "../../../../.agents/skills/*/SKILL.md",
  ],
  { query: "?raw", import: "default", eager: true },
);

const ROOT = "../../../../";

// A file by its path from the repo root, or "" when it isn't there.
export function repoFile(path: string): string {
  return files[ROOT + path] ?? "";
}

// Every file under a folder, keyed by its path from the repo root.
export function repoFolder(folder: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files)
      .filter(([key]) => key.startsWith(ROOT + folder))
      .map(([key, text]) => [key.slice(ROOT.length), text]),
  );
}
