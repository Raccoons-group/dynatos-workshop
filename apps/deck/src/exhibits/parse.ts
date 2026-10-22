// Turns the repo's own files into what the exhibits show. Pure functions over the files' text, so they can be
// tested without Vite. The files are ours, but they still render as text only.

import { STATION_SKILLS } from "../ribbon";

// The lines under a `## Heading`, up to the next heading of the same or a higher level.
export function section(markdown: string, heading: string): string[] {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,2} /.test(line));
  return end === -1 ? rest : rest.slice(0, end);
}

// Markdown links, code spans and emphasis, reduced to their text.
export function plain(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

const bullets = (lines: string[]) =>
  lines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2));

export type MapExhibit = {
  decisions: { title: string; gist: string }[];
  open: string[];
  outOfScope: string[];
};

// The wayfinder map: one line per resolved ticket, what's still in the fog, and what was left out on purpose.
export function mapExhibit(markdown: string): MapExhibit {
  const fog = section(markdown, "Not yet specified")
    .map((line) => line.replace(/^- /, "").trim())
    .filter((line) => line && !line.startsWith("<!--"));
  return {
    decisions: bullets(section(markdown, "Decisions so far")).map((line) => {
      const [, title = line, gist = ""] =
        /^\[([^\]]*)\]\([^)]*\):\s*(.*)$/.exec(line) ?? [];
      return { title: plain(title), gist: plain(gist) };
    }),
    open: fog.map(plain),
    outOfScope: bullets(section(markdown, "Out of scope")).map(
      (line) => /^\*\*([^*]+?)\.?\*\*/.exec(line)?.[1] ?? plain(line),
    ),
  };
}

export type GlossaryExhibit = {
  sections: {
    title: string;
    terms: { term: string; avoid: string[] }[];
    // Terms past `max`, which don't fit on the slide.
    more: number;
  }[];
};

// A glossary in the domain-modeling format: `### Section`, then `**Term**:`, a definition, and `_Avoid_: …`.
// At most `max` terms per section, so the longest section still fits on a slide.
export function glossaryExhibit(markdown: string, max = 9): GlossaryExhibit {
  const sections: {
    title: string;
    terms: { term: string; avoid: string[] }[];
  }[] = [];
  for (const line of markdown.split("\n")) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) sections.push({ title: heading[1]!.trim(), terms: [] });
    const term = /^\*\*(.+?)\*\*:?\s*$/.exec(line);
    if (term && sections.length)
      sections.at(-1)!.terms.push({ term: term[1]!, avoid: [] });
    const avoid = /^_Avoid_:\s*(.+)$/.exec(line);
    const last = sections.at(-1)?.terms.at(-1);
    if (avoid && last)
      last.avoid = avoid[1]!
        .split(",")
        .map((word) => word.replace(/\s*\(.*$/, "").trim())
        .filter(Boolean);
  }
  return {
    sections: sections
      .filter((s) => s.terms.length)
      .map((s) => ({
        title: s.title,
        terms: s.terms.slice(0, max),
        more: Math.max(0, s.terms.length - max),
      })),
  };
}

// The `name` and `description` from a SKILL.md's frontmatter.
export function skillMeta(text: string): { name: string; description: string } {
  const front = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  const field = (key: string) =>
    new RegExp(`^${key}:\\s*(.*)$`, "m")
      .exec(front)?.[1]
      ?.trim()
      .replace(/^(["'])(.*)\1$/, "$2") ?? "";
  return { name: field("name"), description: field("description") };
}

export type SkillsExhibit = {
  toolkit: { station: string; skills: { name: string; present: boolean }[] }[];
  others: { name: string; description: string }[];
};

// `.agents/skills`, laid onto the ribbon: each station's everyday skill, lit once its folder exists, then the
// rest of the library.
export function skillsExhibit(files: Record<string, string>): SkillsExhibit {
  const skills = Object.values(files)
    .map(skillMeta)
    .filter((s) => s.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  const names = new Set(skills.map((s) => s.name));
  const onRibbon = new Set(STATION_SKILLS.flatMap(([, s]) => s));
  return {
    toolkit: STATION_SKILLS.map(([station, list]) => ({
      station,
      skills: list.map((name) => ({ name, present: names.has(name) })),
    })),
    others: skills.filter((s) => !onRibbon.has(s.name)),
  };
}

export type FileExcerpt = { lines: string[]; more: number };

// The first lines of a file, and how many lines didn't fit on the slide.
export function excerpt(text: string, max: number): FileExcerpt {
  const lines = text.replace(/\n+$/, "").split("\n");
  return { lines: lines.slice(0, max), more: Math.max(0, lines.length - max) };
}
