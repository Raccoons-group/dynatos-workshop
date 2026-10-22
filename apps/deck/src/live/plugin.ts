// The live-data plugin: serves the synced data branch as one JSON snapshot, and pushes a fresh snapshot over
// Vite's websocket whenever a file changes. The sync script keeps the folder current:
//
//   <dir>/data/        a checkout of the live-deck-data branch (groups/*.json and top-level JSON files)
//   <dir>/meta.json    the last fetch time and the repo's PR list
//
// A group file that doesn't parse (a checkout caught mid-write) or doesn't match the observation schema keeps
// that group's last good observation, so the projector never shows an error or an empty card.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";

import { loadSchema, validate } from "../../../../scripts/lib/schema.mjs";
import { LIVE_ENDPOINT, LIVE_EVENT } from "./constants";
import type { LiveMeta, LiveSnapshot, Observation } from "./types";

export const OBSERVATION_SCHEMA = fileURLToPath(
  new URL(
    "../../../../.claude/skills/reporter/observation.schema.json",
    import.meta.url,
  ),
);

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

function jsonFiles(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((file) => file.endsWith(".json"))
        .sort()
    : [];
}

export function createLiveReader(
  dir: string,
  { schemaFile = OBSERVATION_SCHEMA } = {},
) {
  const schema = loadSchema(schemaFile);
  const lastGood = new Map<string, unknown>();

  // Keeps the last value that read cleanly; reports the file when the current one doesn't.
  function readKept(
    file: string,
    key: string,
    rejected: string[],
    check?: (value: unknown) => string[],
  ): unknown {
    try {
      const value = readJson(file);
      const errors = check ? check(value) : [];
      if (errors.length) throw new Error(errors.join("; "));
      lastGood.set(key, value);
    } catch {
      rejected.push(key);
    }
    return lastGood.get(key);
  }

  function snapshot(): LiveSnapshot {
    const rejected: string[] = [];
    const dataDir = resolve(dir, "data");
    const groupsDir = join(dataDir, "groups");

    const groups: Record<string, Observation> = {};
    for (const file of jsonFiles(groupsDir)) {
      const key = `groups/${file}`;
      const value = readKept(join(groupsDir, file), key, rejected, (v) =>
        validate(schema, v),
      ) as Observation | undefined;
      if (value) groups[value.group] = value;
    }

    const docs: Record<string, unknown> = {};
    for (const file of jsonFiles(dataDir)) {
      const value = readKept(join(dataDir, file), file, rejected);
      if (value !== undefined) docs[file.replace(/\.json$/, "")] = value;
    }

    const metaFile = resolve(dir, "meta.json");
    const meta = existsSync(metaFile)
      ? ((readKept(metaFile, "meta.json", rejected) as LiveMeta | undefined) ??
        null)
      : null;

    return { groups, docs, meta, readAt: new Date().toISOString(), rejected };
  }

  return { snapshot };
}

export function liveDeckData({ dir }: { dir: string }): Plugin {
  const root = resolve(dir);
  const reader = createLiveReader(root);
  const serve: Connect.NextHandleFunction = (_req, res) => {
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify(reader.snapshot()));
  };

  return {
    name: "live-deck-data",
    configureServer(server) {
      server.middlewares.use(LIVE_ENDPOINT, serve);
      server.watcher.add(root);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const onFile = (file: string) => {
        const path = resolve(file);
        if (!path.startsWith(root) || path.includes(`${root}/data/.git`))
          return;
        clearTimeout(timer);
        timer = setTimeout(
          () =>
            server.ws.send({
              type: "custom",
              event: LIVE_EVENT,
              data: reader.snapshot(),
            }),
          150,
        );
      };
      server.watcher.on("add", onFile);
      server.watcher.on("change", onFile);
      server.watcher.on("unlink", onFile);
    },
    // A built deck served with `vite preview`: same endpoint, and the client polls instead.
    configurePreviewServer(server) {
      server.middlewares.use(LIVE_ENDPOINT, serve);
    },
  };
}
