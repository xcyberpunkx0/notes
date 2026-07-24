-- DSA Vault initial schema

CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL DEFAULT '[]',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notes_topic ON notes(topic_id);

CREATE TABLE problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT,
  url TEXT,
  difficulty TEXT,
  date_solved TEXT,
  confidence INTEGER,
  time_taken_min INTEGER,
  solved_myself INTEGER NOT NULL DEFAULT 1,
  hints_used INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  solution_link TEXT,
  video_link TEXT,
  -- debrief: the reusable learning nuggets
  concept_taught TEXT,
  wrong_approach TEXT,
  stuck_where TEXT,
  mistake_made TEXT,
  unlock_pattern TEXT,
  remember_next TEXT,
  six_month_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE problem_topics (
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, topic_id)
);

CREATE TABLE problem_code (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'cpp',
  variant TEXT NOT NULL DEFAULT 'optimized', -- brute | optimized | other
  code TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_problem_code ON problem_code(problem_id);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE problem_tags (
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- wiki-links / backlinks between anything and anything
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL, -- note | problem | topic
  source_id INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  UNIQUE (source_type, source_id, target_type, target_id)
);
CREATE INDEX idx_links_source ON links(source_type, source_id);
CREATE INDEX idx_links_target ON links(target_type, target_id);

-- spaced repetition state, one row per enrolled item
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type TEXT NOT NULL, -- note | problem
  item_id INTEGER NOT NULL,
  due_at TEXT NOT NULL,
  interval_days REAL NOT NULL DEFAULT 0,
  ease REAL NOT NULL DEFAULT 2.5,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TEXT,
  UNIQUE (item_type, item_id)
);
CREATE INDEX idx_reviews_due ON reviews(due_at);

CREATE TABLE review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  rating TEXT NOT NULL, -- forgot | hard | good | easy
  reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- one row per day; feeds streaks now, the heatmap later
CREATE TABLE activity (
  date TEXT PRIMARY KEY, -- YYYY-MM-DD
  notes_created INTEGER NOT NULL DEFAULT 0,
  problems_logged INTEGER NOT NULL DEFAULT 0,
  reviews_done INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- full-text search; rowid mirrors the source table's id, app code keeps them in sync
CREATE VIRTUAL TABLE notes_fts USING fts5(title, content_text);
CREATE VIRTUAL TABLE problems_fts USING fts5(title, debrief_text, code_text);
