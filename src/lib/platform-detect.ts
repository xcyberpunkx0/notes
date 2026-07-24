export const PLATFORMS = [
  "LeetCode",
  "Codeforces",
  "AtCoder",
  "CodeChef",
  "HackerRank",
  "HackerEarth",
  "GeeksforGeeks",
  "CSES",
  "SPOJ",
  "Other",
] as const;

export type Platform = (typeof PLATFORMS)[number];

const HOST_MAP: [string, Platform][] = [
  ["leetcode", "LeetCode"],
  ["codeforces", "Codeforces"],
  ["atcoder", "AtCoder"],
  ["codechef", "CodeChef"],
  ["hackerrank", "HackerRank"],
  ["hackerearth", "HackerEarth"],
  ["geeksforgeeks", "GeeksforGeeks"],
  ["cses.fi", "CSES"],
  ["spoj", "SPOJ"],
];

/** Guesses the judge platform from a problem URL. */
export function detectPlatform(url: string): Platform | null {
  if (!url.trim()) return null;
  let host: string;
  try {
    host = new URL(url.includes("://") ? url : `https://${url}`).host;
  } catch {
    return null;
  }
  const match = HOST_MAP.find(([needle]) => host.includes(needle));
  return match ? match[1] : "Other";
}

/** Best-effort problem title from a URL slug, e.g. two-sum → Two Sum. */
export function titleFromUrl(url: string): string | null {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    const segments = u.pathname.split("/").filter(Boolean);
    const slugIndex =
      segments.indexOf("problems") >= 0
        ? segments.indexOf("problems") + 1
        : -1;
    const slug = slugIndex > 0 ? segments[slugIndex] : null;
    if (!slug || /^\d+$/.test(slug)) return null;
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return null;
  }
}
