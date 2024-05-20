/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createType("user_type", ["super_admin", "reg_admin", "tutor", "student"]);

  pgm.createType("repeat_type", [
    "no_repeat",
    "daily",
    "every_week",
    "every_month",
  ]);

  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true, notNull: true },
    email: { type: "varchar(1000)", notNull: true, unique: true },
    password: { type: "varchar(100)", notNull: true },
    name: { type: "varchar(100)", notNull: true },
    avatar: { type: "varchar(255)", default: null },
    type: { type: "user_type", notNull: true },
  });

  pgm.createTable("tutors", {
    id: {
      type: "serial",
      notNull: true,
      primaryKey: true,
      references: "users(id)",
    },
    bio: { type: "varchar(1000)", default: null },
    about: { type: "text", default: null },
    video: { type: "varchar(255)", default: null },
    authorized_zoom_app: { type: "boolean", notNull: true, default: false },
    zoom_refresh_token: { type: "varchar(1000)", default: null },
    aquired_refresh_token_at: { type: "timestamp", default: null },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createTable("slots", {
    id: { type: "serial", primaryKey: true, notNull: true },
    tutor_id: { type: "serial", notNull: true, references: "users(id)" },
    title: { type: "varchar(255)", notNull: true },
    description: { type: "text", default: null },
    weekday: { type: "smallint", notNull: true },
    start_time: { type: "time", notNull: true },
    end_time: { type: "time", notNull: true },
    start_date: { type: "date", notNull: true },
    end_date: { type: "date", default: null },
    repeat_type: { type: "repeat_type", notNull: true, default: "no_repeat" },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createTable("lessons", {
    id: { type: "serial", primaryKey: true, unique: true, notNull: true },
    tutor_id: { type: "serial", notNull: true, references: "users(id)" },
    student_id: { type: "serial", notNull: true, references: "users(id)" },
    slot_id: { type: "serial", notNull: true, references: "slots(id)" },
    zoom_meeting_id: { type: "bigint", notNull: true, unique: true },
    start: { type: "timestamp", notNull: true },
    end: { type: "timestamp", notNull: true },
    meeting_url: { type: "varchar(255)", notNull: true },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("lessons", "id");
  pgm.createIndex("slots", "id");
  pgm.createIndex("tutors", "id");
  pgm.createIndex("users", "id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // indexes
  pgm.dropIndex("lessons", "id", { ifExists: true });
  pgm.dropIndex("slots", "id", { ifExists: true });
  pgm.dropIndex("tutors", "id", { ifExists: true });
  pgm.dropIndex("users", "id", { ifExists: true });

  // tables
  pgm.dropTable("lessons", { ifExists: true });
  pgm.dropTable("slots", { ifExists: true });
  pgm.dropTable("tutors", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });
  // types
  pgm.dropType("user_type", { ifExists: true });
  pgm.dropType("repeat_type", { ifExists: true });
};
