import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

/**
 * Single shared SQLite connection. Loading the database also runs any
 * pending migrations registered on the Rust side (src-tauri/migrations).
 */
export function getDb(): Promise<Database> {
  dbPromise ??= Database.load("sqlite:dsavault.db");
  return dbPromise;
}
