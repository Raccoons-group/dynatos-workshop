// The one place the scripts talk to GitHub. Tests swap in `recordedGitHub` with canned responses.
//
// Every adapter offers:
//   pullRequest(n)  → { draft, headRef, baseRef, headSha }
//   labelEvents(n)  → [{ label, action: "labeled" | "unlabeled", at }]  (oldest first)
//   commitShas(n)   → [sha]                                            (oldest first)
//   checkRuns(sha)  → [{ name, status, conclusion, completedAt }]
//   pullRequests({ base }) → [{ number, title, body, state: "open" | "merged" | "closed", draft, baseRef,
//                               headRef, headSha, createdAt, mergedAt }]           (oldest first)
//   pullRequestFiles(n)    → [{ path, status: "added" | "modified" | "removed" | "renamed" | … }]
//   fileAt(path, ref)      → the file's text at that ref, or null when it isn't there

export function liveGitHub({ repo, token, fetchImpl = globalThis.fetch }) {
  if (!repo) throw new Error("liveGitHub needs a repo (owner/name).");

  async function api(pathname) {
    const results = [];
    let url = `https://api.github.com/repos/${repo}${pathname}${pathname.includes("?") ? "&" : "?"}per_page=100`;
    while (url) {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok)
        throw new Error(`GitHub ${response.status} for ${pathname}`);
      const body = await response.json();
      if (!Array.isArray(body) && !Array.isArray(body.check_runs)) return body;
      results.push(...(Array.isArray(body) ? body : body.check_runs));
      url = /<([^>]+)>;\s*rel="next"/.exec(
        response.headers.get("link") ?? "",
      )?.[1];
    }
    return results;
  }

  return {
    async pullRequest(number) {
      const pr = await api(`/pulls/${number}`);
      return {
        draft: pr.draft,
        headRef: pr.head.ref,
        baseRef: pr.base.ref,
        headSha: pr.head.sha,
      };
    },
    async labelEvents(number) {
      const events = await api(`/issues/${number}/events`);
      return events
        .filter(
          (event) => event.event === "labeled" || event.event === "unlabeled",
        )
        .map((event) => ({
          label: event.label.name,
          action: event.event,
          at: event.created_at,
        }));
    },
    async commitShas(number) {
      return (await api(`/pulls/${number}/commits`)).map(
        (commit) => commit.sha,
      );
    },
    async checkRuns(sha) {
      return (await api(`/commits/${sha}/check-runs`)).map((run) => ({
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        completedAt: run.completed_at,
      }));
    },
    async pullRequests({ base } = {}) {
      const query = `?state=all&sort=created&direction=asc${base ? `&base=${encodeURIComponent(base)}` : ""}`;
      return (await api(`/pulls${query}`)).map((pr) => ({
        number: pr.number,
        title: pr.title,
        body: pr.body ?? "",
        state: pr.merged_at ? "merged" : pr.state,
        draft: Boolean(pr.draft),
        baseRef: pr.base.ref,
        headRef: pr.head.ref,
        headSha: pr.head.sha,
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
      }));
    },
    async pullRequestFiles(number) {
      return (await api(`/pulls/${number}/files`)).map((file) => ({
        path: file.filename,
        status: file.status,
      }));
    },
    async fileAt(file, ref) {
      const encoded = file.split("/").map(encodeURIComponent).join("/");
      const response = await fetchImpl(
        `https://api.github.com/repos/${repo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`,
        {
          headers: {
            Accept: "application/vnd.github.raw+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(`GitHub ${response.status} for ${file} at ${ref}`);
      return response.text();
    },
  };
}

export function recordedGitHub({
  pullRequests = {},
  labelEvents = {},
  commitShas = {},
  checkRuns = {},
  pullRequestList = [],
  pullRequestFiles = {},
  // Keyed "<ref>:<path>".
  files = {},
}) {
  return {
    pullRequest: async (number) => pullRequests[number],
    labelEvents: async (number) => labelEvents[number] ?? [],
    commitShas: async (number) => commitShas[number] ?? [],
    checkRuns: async (sha) => checkRuns[sha] ?? [],
    pullRequests: async ({ base } = {}) =>
      pullRequestList.filter((pr) => !base || pr.baseRef === base),
    pullRequestFiles: async (number) => pullRequestFiles[number] ?? [],
    fileAt: async (file, ref) => files[`${ref}:${file}`] ?? null,
  };
}
