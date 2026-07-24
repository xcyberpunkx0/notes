import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

let pending: Update | null = null;

/** Checks GitHub releases for a newer signed build. Silent on failure. */
export async function checkForUpdate(): Promise<string | null> {
  try {
    const update = await check();
    if (update) {
      pending = update;
      return update.version;
    }
  } catch {
    // offline or no releases yet — never bother the user about it
  }
  return null;
}

export async function installPendingUpdate(): Promise<void> {
  if (!pending) return;
  await pending.downloadAndInstall();
  await relaunch();
}
