import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const git = (...args: string[]) =>
  execFileSync("git", ["-c", "core.quotePath=false", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });

// The text of a note, without its frontmatter.
const bodyOf = (source: string) =>
  source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();

// If the file is a staged rename that isn't committed yet, its previous path.
const stagedRenameSource = (filePath: string) => {
  const line = git("diff", "--cached", "-M", "--name-status", "--diff-filter=R")
    .split("\n")
    .find(l => l.split("\t")[2] === filePath);
  return line?.split("\t")[1];
};

// Commits that touched the file (following renames), newest first, with the
// path the file had in each of them.
const history = (filePath: string) => {
  const commits: { hash: string; date: string; path: string }[] = [];
  const lines = git(
    "log",
    "--follow",
    "--format=%H %cI",
    "--name-only",
    "--",
    filePath
  ).split("\n");
  let header: string[] | undefined;
  for (const line of lines) {
    if (/^[0-9a-f]{40} \S+$/.test(line)) header = line.split(" ");
    else if (line && header) {
      commits.push({ hash: header[0], date: header[1], path: line });
      header = undefined;
    }
  }
  return commits;
};

const cache = new Map<string, Date>();

const compute = (filePath: string): Date => {
  const mtime = () => statSync(filePath).mtime;
  try {
    const body = bodyOf(readFileSync(filePath, "utf8"));
    let commits = history(filePath);
    if (!commits.length) {
      const source = stagedRenameSource(filePath);
      if (source) commits = history(source);
    }

    // Walk back through the commits that left the text as it is now; the
    // oldest of them is the one that last changed it.
    let lastChange: string | undefined;
    for (const { hash, date, path } of commits) {
      if (bodyOf(git("show", `${hash}:${path}`)) !== body) break;
      lastChange = date;
    }
    // No match at all means the text has uncommitted edits.
    return lastChange ? new Date(lastChange) : mtime();
  } catch {
    try {
      return mtime();
    } catch {
      return new Date();
    }
  }
};

// When the text of a note last changed: the date of the last commit that
// edited its body. Renames and frontmatter-only edits (tags, description)
// don't count. Uncommitted text edits fall back to the file's mtime.
const getLastUpdated = (filePath?: string): Date => {
  if (!filePath) return new Date();
  let date = cache.get(filePath);
  if (!date) cache.set(filePath, (date = compute(filePath)));
  return date;
};

export default getLastUpdated;
