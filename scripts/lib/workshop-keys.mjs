// Reads `docs/agents/workshop.md`: the group, branches and working-out folder a base branch belongs to.
// The cut script writes these values on each base; on `main` they're "none".

const KEYS = {
  Group: "group",
  "Base branch": "baseBranch",
  "Work branch": "workBranch",
  "Working-out": "workingOut",
  Epic: "epic",
};

export function parseWorkshopKeys(text) {
  const keys = {
    group: null,
    baseBranch: null,
    workBranch: null,
    workingOut: null,
    epic: null,
  };
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Za-z -]+):\s*(.*?)\s*$/.exec(line);
    if (!match || !(match[1] in KEYS)) continue;
    const value = match[2].replace(/^`|`$/g, "");
    keys[KEYS[match[1]]] =
      value && value.toLowerCase() !== "none" ? value : null;
  }
  if (keys.workingOut && !keys.workingOut.endsWith("/")) keys.workingOut += "/";
  return keys;
}

// The group a PR's head branch belongs to: the part before the first "/" (group-a/group-orders → group-a).
export function groupOfBranch(ref) {
  const branch = ref.replace(/^refs\/heads\//, "");
  return branch.includes("/") ? branch.slice(0, branch.indexOf("/")) : null;
}

// Null when the PR targets its own group's base, otherwise the message the workflow fails with.
export function targetMismatch({ keys, headRef }) {
  const headGroup = groupOfBranch(headRef);
  if (!keys.group)
    return `This PR targets a branch that belongs to no group. Retarget it to ${headGroup ?? "<group>"}/main.`;
  if (headGroup !== keys.group)
    return `This PR goes from ${headRef} into ${keys.group}'s base. Retarget it to ${headGroup ?? "<group>"}/main.`;
  return null;
}

// The cut writes each base's values into the same lines it reads. Values left out keep what's there; null
// writes "none".
export function setWorkshopKeys(text, values) {
  const lines = text.split("\n");
  for (const [label, key] of Object.entries(KEYS)) {
    if (!(key in values)) continue;
    const line = `${label}: ${values[key] ?? "none"}`;
    const index = lines.findIndex((l) => l.startsWith(`${label}:`));
    if (index === -1) lines.push(line);
    else lines[index] = line;
  }
  return lines.join("\n");
}
