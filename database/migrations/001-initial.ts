import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// Events table
export const events = sqliteTable('events', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  coupleNames: text('couple_names').notNull(),
  eventDate: text('event_date').notNull(),
  language: text('language').default('malay'),
  style: text('style').default('default'),
  defaultSong: text('default_song'),
  chosenSong: text('chosen_song'),
  customSongPath: text('custom_song_path'),
  customSongConsent: integer('custom_song_consent', { mode: 'boolean' }).default(false),
  adminPinHash: text('admin_pin_hash').notNull(),
  status: text('status').default('active'),
  firstUploadTime: integer('first_upload_time', { mode: 'timestamp' }),
  autoEndHours: integer('auto_end_hours').default(8),
  endTime: integer('end_time', { mode: 'timestamp' }),
  retentionDays: integer('retention_days').default(90),
  purgeDate: integer('purge_date', { mode: 'timestamp' }),
  ownerNote: text('owner_note'),
  paid: integer('paid', { mode: 'boolean' }).default(false),
  reEditCount: integer('re_edit_count').default(0),
  createdTime: integer('created_time', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Guests table
export const guests = sqliteTable('guests', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  name: text('name').notNull(),
  tokenHash: text('token_hash').notNull(),
  createdTime: integer('created_time', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Photos table
export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  guestId: integer('guest_id').references(() => guests.id),
  clientId: text('client_id').notNull(),
  filePath: text('file_path').notNull(),
  thumbnailPath: text('thumbnail_path').notNull(),
  aiThumbnailPath: text('ai_thumbnail_path'),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  size: integer('size').notNull(),
  cheapQualityScore: real('cheap_quality_score'),
  perceptualHash: text('perceptual_hash'),
  aiAnalysis: text('ai_analysis', { mode: 'json' }),
  sceneType: text('scene_type'),
  subjectFocusPosition: text('subject_focus_position', { mode: 'json' }),
  aiQualityScore: real('ai_quality_score'),
  aiExclusionFlag: integer('ai_exclusion_flag', { mode: 'boolean' }).default(false),
  aiExclusionReason: text('ai_exclusion_reason'),
  hidden: integer('hidden', { mode: 'boolean' }).default(false),
  createdTime: integer('created_time', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Wishes table
export const wishes = sqliteTable('wishes', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  guestId: integer('guest_id').references(() => guests.id),
  message: text('message').notNull(),
  photoId: integer('photo_id').references(() => photos.id),
  hidden: integer('hidden', { mode: 'boolean' }).default(false),
  aiQualityScore: real('ai_quality_score'),
  aiSelectionFlag: integer('ai_selection_flag', { mode: 'boolean' }).default(false),
  aiSelectionReason: text('ai_selection_reason'),
  createdTime: integer('created_time', { mode: 'timestamp' }).notNull().defaultNow(),
});

// Montages table
export const montages = sqliteTable('montages', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  versionNumber: integer('version_number').notNull(),
  status: text('status').notNull(),
  editor: text('editor').notNull(),
  editPlan: text('edit_plan', { mode: 'json' }).notNull(),
  photosUsed: integer('photos_used').notNull(),
  wishesUsed: integer('wishes_used').notNull(),
  finalDuration: real('final_duration').notNull(),
  previewPath: text('preview_path'),
  finalPath: text('final_path'),
  errorMessage: text('error_message'),
  aiTokensIn: integer('ai_tokens_in'),
  aiTokensOut: integer('ai_tokens_out'),
  estimatedAiCost: real('estimated_ai_cost'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull().defaultNow(),
  finishTime: integer('finish_time', { mode: 'timestamp' }),
});

// Jobs table
export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey(),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  status: text('status').notNull(),
  attempts: integer('attempts').default(0),
  nextRunTime: integer('next_run_time', { mode: 'timestamp' }),
  lastError: text('last_error'),
  createdTime: integer('created_time', { mode: 'timestamp' }).notNull().defaultNow(),
  finishedTime: integer('finished_time', { mode: 'timestamp' }),
});

// Migration function
export async function up(db: any) {
  await db.run(sql`CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    couple_names TEXT NOT NULL,
    event_date TEXT NOT NULL,
    language TEXT DEFAULT 'malay',
    style TEXT DEFAULT 'default',
    default_song TEXT,
    chosen_song TEXT,
    custom_song_path TEXT,
    custom_song_consent INTEGER DEFAULT 0,
    admin_pin_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    first_upload_time INTEGER,
    auto_end_hours INTEGER DEFAULT 8,
    end_time INTEGER,
    retention_days INTEGER DEFAULT 90,
    purge_date INTEGER,
    owner_note TEXT,
    paid INTEGER DEFAULT 0,
    re_edit_count INTEGER DEFAULT 0,
    created_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  await db.run(sql`CREATE TABLE guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id),
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    created_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  await db.run(sql`CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id),
    guest_id INTEGER REFERENCES guests(id),
    client_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    ai_thumbnail_path TEXT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    size INTEGER NOT NULL,
    cheap_quality_score REAL,
    perceptual_hash TEXT,
    ai_analysis TEXT,
    scene_type TEXT,
    subject_focus_position TEXT,
    ai_quality_score REAL,
    ai_exclusion_flag INTEGER DEFAULT 0,
    ai_exclusion_reason TEXT,
    hidden INTEGER DEFAULT 0,
    created_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  await db.run(sql`CREATE TABLE wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id),
    guest_id INTEGER REFERENCES guests(id),
    message TEXT NOT NULL,
    photo_id INTEGER REFERENCES photos(id),
    hidden INTEGER DEFAULT 0,
    ai_quality_score REAL,
    ai_selection_flag INTEGER DEFAULT 0,
    ai_selection_reason TEXT,
    created_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  await db.run(sql`CREATE TABLE montages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id),
    version_number INTEGER NOT NULL,
    status TEXT NOT NULL,
    editor TEXT NOT NULL,
    edit_plan TEXT NOT NULL,
    photos_used INTEGER NOT NULL,
    wishes_used INTEGER NOT NULL,
    final_duration REAL NOT NULL,
    preview_path TEXT,
    final_path TEXT,
    error_message TEXT,
    ai_tokens_in INTEGER,
    ai_tokens_out INTEGER,
    estimated_ai_cost REAL,
    start_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    finish_time INTEGER
  );`);

  await db.run(sql`CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    next_run_time INTEGER,
    last_error TEXT,
    created_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    finished_time INTEGER
  );`);
}

// Rollback function
export async function down(db: any) {
  await db.run(sql`DROP TABLE IF EXISTS jobs;`);
  await db.run(sql`DROP TABLE IF EXISTS montages;`);
  await db.run(sql`DROP TABLE IF EXISTS wishes;`);
  await db.run(sql`DROP TABLE IF EXISTS photos;`);
  await db.run(sql`DROP TABLE IF EXISTS guests;`);
  await db.run(sql`DROP TABLE IF EXISTS events;`);
}