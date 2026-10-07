import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const defaultDataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(defaultDataDir)) {
  fs.mkdirSync(defaultDataDir, { recursive: true });
}

// Database file path from env or default
const dbPath =
  process.env.DATABASE_PATH || path.join(defaultDataDir, "reviews.db");

console.log(`[Database] Connecting to SQLite at: ${dbPath}`);

const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Run migrations / initialize schema
export function initDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      userId TEXT DEFAULT 'anonymous_traveler',
      userName TEXT NOT NULL,
      location TEXT DEFAULT 'Verified Traveler',
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews(createdAt DESC);
  `;

  db.exec(schema);
  console.log("[Database] Schema verified and ready.");
}

// Initialize on module load
initDatabase();

export default db;
