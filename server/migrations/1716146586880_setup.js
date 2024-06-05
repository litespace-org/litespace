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
  // types
  pgm.createType("user_type", [
    "super_admin",
    "reg_admin",
    "examiner",
    "tutor",
    "student",
  ]);
  pgm.createType("repeat_type", ["no", "daily", "weekly", "monthly"]);
  pgm.createType("user_gender_type", ["male", "female"]);

  // tables
  pgm.createTable("sessons", {
    sid: { type: "CHARACTER VARYING", primaryKey: true, notNull: true },
    sess: { type: "JSON", notNull: true },
    expire: { type: "TIMESTAMP(6) WITHOUT TIME ZONE", notNull: true },
  });

  pgm.createTable("users", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    email: { type: "VARCHAR(50)", notNull: true, unique: true },
    password: { type: "CHAR(64)", default: null },
    name: { type: "VARCHAR(50)", default: null },
    avatar: { type: "VARCHAR(255)", default: null },
    type: { type: "user_type", default: null },
    birthday: { type: "DATE", default: null },
    gender: { type: "user_gender_type", default: null },
    active: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMPTZ", notNull: true, default: "NOW()" },
    updated_at: { type: "TIMESTAMPTZ", notNull: true, default: "NOW()" },
  });

  pgm.createTable("examiners", {
    id: {
      type: "SERIAL",
      notNull: true,
      primaryKey: true,
      references: "users(id)",
    },
    authorized_zoom_app: { type: "boolean", notNull: true, default: false },
    zoom_refresh_token: { type: "VARCHAR(1000)", default: null },
    aquired_refresh_token_at: { type: "TIMESTAMPTZ", default: null },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("tutors", {
    id: {
      type: "SERIAL",
      notNull: true,
      primaryKey: true,
      references: "users(id)",
    },
    bio: { type: "VARCHAR(1000)", default: null },
    about: { type: "TEXT", default: null },
    video: { type: "VARCHAR(255)", default: null },
    authorized_zoom_app: { type: "boolean", notNull: true, default: false },
    zoom_refresh_token: { type: "VARCHAR(1000)", default: null },
    aquired_refresh_token_at: { type: "TIMESTAMPTZ", default: null },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("slots", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    tutor_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    title: { type: "VARCHAR(255)", notNull: true },
    weekday: { type: "SMALLINT", notNull: true },
    start_time: { type: "TIME", notNull: true },
    end_time: { type: "TIME", notNull: true },
    start_date: { type: "TIMESTAMPTZ", notNull: true },
    end_date: { type: "TIMESTAMPTZ", default: null },
    repeat: { type: "repeat_type", notNull: true, default: "no" },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("lessons", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    tutor_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    student_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    slot_id: { type: "SERIAL", notNull: true, references: "slots(id)" },
    zoom_meeting_id: { type: "BIGINT", notNull: true, unique: true },
    start: { type: "TIMESTAMPTZ", notNull: true },
    duration: { type: "SMALLINT", notNull: true },
    meeting_url: { type: "VARCHAR(255)", notNull: true },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("ratings", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    tutor_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    student_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    value: { type: "SMALLINT", notNull: true },
    note: { type: "TEXT" },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("subscriptions", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    student_id: {
      type: "SERIAL",
      notNull: true,
      references: "users(id)",
      unique: true,
    },
    monthly_minutes: { type: "SMALLINT", notNull: true },
    remaining_minutes: { type: "SMALLINT", notNull: true },
    auto_renewal: { type: "BOOLEAN", notNull: true, default: false },
    start: { type: "TIMESTAMPTZ", notNull: true },
    end: { type: "TIMESTAMPTZ", notNull: true },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("rooms", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    tutor_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    student_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("messages", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    room_id: { type: "SERIAL", notNull: true, references: "rooms(id)" },
    reply_id: { type: "INTEGER", references: "messages(id)", default: null },
    body: { type: "VARCHAR(1000)", notNull: true },
    is_read: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  // indexes
  pgm.createIndex("lessons", "id");
  pgm.createIndex("slots", "id");
  pgm.createIndex("tutors", "id");
  pgm.createIndex("examiners", "id");
  pgm.createIndex("users", "id");
  pgm.createIndex("ratings", "id");
  pgm.createIndex("subscriptions", "id");
  pgm.createIndex("rooms", "id");
  pgm.createIndex("messages", "id");

  // constraints
  pgm.createConstraint("ratings", "ratings-student-tutor", {
    unique: [["student_id", "tutor_id"]],
  });

  pgm.createConstraint("rooms", "rooms-student-tutor", {
    unique: [["student_id", "tutor_id"]],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // constraints
  pgm.dropConstraint("ratings", "ratings-student-tutor", { ifExists: true });
  pgm.dropConstraint("rooms", "rooms-student-tutor", { ifExists: true });

  // indexes
  pgm.dropIndex("messages", "id", { ifExists: true });
  pgm.dropIndex("rooms", "id", { ifExists: true });
  pgm.dropIndex("subscriptions", "id", { ifExists: true });
  pgm.dropIndex("ratings", "id", { ifExists: true });
  pgm.dropIndex("lessons", "id", { ifExists: true });
  pgm.dropIndex("slots", "id", { ifExists: true });
  pgm.dropIndex("examiners", "id", { ifExists: true });
  pgm.dropIndex("tutors", "id", { ifExists: true });
  pgm.dropIndex("users", "id", { ifExists: true });

  // tables
  pgm.dropTable("messages", { ifExists: true });
  pgm.dropTable("rooms", { ifExists: true });
  pgm.dropTable("subscriptions", { ifExists: true });
  pgm.dropTable("ratings", { ifExists: true });
  pgm.dropTable("lessons", { ifExists: true });
  pgm.dropTable("slots", { ifExists: true });
  pgm.dropTable("examiners", { ifExists: true });
  pgm.dropTable("tutors", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });
  pgm.dropTable("sessons", { ifExists: true });

  // types
  pgm.dropType("user_type", { ifExists: true });
  pgm.dropType("repeat_type", { ifExists: true });
  pgm.dropType("user_gender_type", { ifExists: true });
};
