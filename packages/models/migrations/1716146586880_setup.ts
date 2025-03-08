import { MigrationBuilder } from "node-pg-migrate";

export function up(pgm: MigrationBuilder) {
  // types
  pgm.createType("user_gender", ["male", "female"]);

  // tables
  pgm.createTable("users", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    email: { type: "VARCHAR(50)", notNull: true, unique: true },
    password: { type: "CHAR(64)", default: null },
    name: { type: "VARCHAR(50)", default: null },
    image: { type: "VARCHAR(255)", default: null },
    role: { type: "smallint", default: null },
    birth_year: { type: "INT", default: null },
    gender: { type: "user_gender", default: null },
    verified_email: { type: "BOOLEAN", notNull: true, default: false },
    verified_phone: { type: "BOOLEAN", notNull: true, default: false },
    phone: { type: "VARCHAR(15)", default: null },
    city: { type: "SMALLINT", default: null },
    credit_score: { type: "INT", notNull: true, default: 0 },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
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
    notice: { type: "INT", notNull: true, default: 0 },
    activated: { type: "BOOLEAN", notNull: true, default: false },
    activated_by: { type: "INT", notNull: false, references: "users(id)" },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("availability_slots", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    start: { type: "TIMESTAMP", notNull: true },
    end: { type: "TIMESTAMP", notNull: true },
    deleted: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("lessons", {
    id: { type: "SERIAL", primaryKey: true, notNull: true, unique: true },
    start: { type: "TIMESTAMP", notNull: true },
    duration: { type: "SMALLINT", notNull: true },
    price: { type: "INT", notNull: true },
    slot_id: {
      type: "SERIAL",
      references: "availability_slots(id)",
      notNull: true,
    },
    session_id: { type: "VARCHAR(50)", notNull: true, primaryKey: true },
    canceled_by: { type: "INT", references: "users(id)", default: null },
    canceled_at: { type: "TIMESTAMP", default: null },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("lesson_members", {
    lesson_id: { type: "SERIAL", notNull: true, references: "lessons(id)" },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("interviews", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    start: { type: "TIMESTAMP", notNull: true },
    interviewer_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    interviewee_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    interviewer_feedback: { type: "TEXT", default: null },
    interviewee_feedback: { type: "TEXT", default: null },
    session_id: { type: "TEXT", notNull: true, primaryKey: true },
    slot_id: {
      type: "SERIAL",
      references: "availability_slots(id)",
      notNull: true,
    },
    note: { type: "TEXT", default: null },
    level: { type: "INT", default: null },
    status: { type: "smallint", notNull: true },
    signer: { type: "INT", references: "users(id)" },
    canceled_by: { type: "INT", references: "users(id)", default: null },
    canceled_at: { type: "TIMESTAMP", default: null },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable(
    "ratings",
    {
      id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
      rater_id: { type: "SERIAL", notNull: true, references: "users(id)" },
      ratee_id: { type: "SERIAL", notNull: true, references: "users(id)" },
      value: { type: "SMALLINT", notNull: true },
      feedback: { type: "TEXT" },
      created_at: { type: "TIMESTAMP", notNull: true },
      updated_at: { type: "TIMESTAMP", notNull: true },
    },
    { constraints: { unique: ["rater_id", "ratee_id"] } }
  );

  pgm.createTable("plans", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    alias: { type: "VARCHAR(255)", notNull: true },
    weekly_minutes: { type: "INT", notNull: true },
    full_month_price: { type: "INT", notNull: true },
    full_quarter_price: { type: "INT", notNull: true },
    half_year_price: { type: "INT", notNull: true },
    full_year_price: { type: "INT", notNull: true },
    full_month_discount: { type: "INT", notNull: true, default: 0 },
    full_quarter_discount: { type: "INT", notNull: true, default: 0 },
    half_year_discount: { type: "INT", notNull: true, default: 0 },
    full_year_discount: { type: "INT", notNull: true, default: 0 },
    active: { type: "BOOLEAN", default: false },
    for_invites_only: { type: "BOOLEAN", default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("topics", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    name_ar: { type: "VARCHAR(50)", notNull: true, unique: true },
    name_en: { type: "VARCHAR(50)", notNull: true, unique: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable(
    "user_topics",
    {
      user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
      topic_id: { type: "SERIAL", notNull: true, references: "topics(id)" },
    },
    { constraints: { primaryKey: ["user_id", "topic_id"] } }
  );

  pgm.createTable("rooms", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable(
    "room_members",
    {
      user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
      room_id: { type: "SERIAL", notNull: true, references: "rooms(id)" },
      pinned: { type: "BOOLEAN", default: false },
      muted: { type: "BOOLEAN", default: false },
      created_at: { type: "TIMESTAMP", notNull: true },
      updated_at: { type: "TIMESTAMP", notNull: true },
    },
    { constraints: { primaryKey: ["user_id", "room_id"] } }
  );

  pgm.createTable("messages", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    room_id: { type: "SERIAL", notNull: true, references: "rooms(id)" },
    text: { type: "VARCHAR(1000)", notNull: true },
    read: { type: "BOOLEAN", notNull: true, default: false },
    deleted: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("contact_requests", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    name: { type: "VARCHAR(50)", notNull: true },
    phone: { type: "VARCHAR(15)", notNull: true },
    title: { type: "VARCHAR(128)", notNull: true },
    message: { type: "VARCHAR(1000)", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
  });

  // indexes
  pgm.createIndex("lessons", "id");
  pgm.createIndex("availability_slots", "id");
  pgm.createIndex("contact_requests", "id");
  pgm.createIndex("tutors", "id");
  pgm.createIndex("users", "id");
  pgm.createIndex("ratings", "id");
  pgm.createIndex("plans", "id");
  pgm.createIndex("rooms", "id");
  pgm.createIndex("messages", "id");
}

export function down(pgm: MigrationBuilder) {
  // indexes
  pgm.dropIndex("availability_slots", "id", { ifExists: true });
  pgm.dropIndex("contact_requests", "id", { ifExists: true });
  pgm.dropIndex("messages", "id", { ifExists: true });
  pgm.dropIndex("rooms", "id", { ifExists: true });
  pgm.dropIndex("plans", "id", { ifExists: true });
  pgm.dropIndex("ratings", "id", { ifExists: true });
  pgm.dropIndex("lessons", "id", { ifExists: true });
  pgm.dropIndex("tutors", "id", { ifExists: true });
  pgm.dropIndex("users", "id", { ifExists: true });

  // tables
  pgm.dropTable("user_topics", { ifExists: true });
  pgm.dropTable("topics", { ifExists: true });
  pgm.dropTable("withdraw_methods", { ifExists: true });
  pgm.dropTable("messages", { ifExists: true });
  pgm.dropTable("room_members", { ifExists: true });
  pgm.dropTable("rooms", { ifExists: true });
  pgm.dropTable("subscriptions", { ifExists: true });
  pgm.dropTable("invites", { ifExists: true });
  pgm.dropTable("coupons", { ifExists: true });
  pgm.dropTable("plans", { ifExists: true });
  pgm.dropTable("report_replies", { ifExists: true });
  pgm.dropTable("reports", { ifExists: true });
  pgm.dropTable("gifts", { ifExists: true });
  pgm.dropTable("ratings", { ifExists: true });
  pgm.dropTable("interviews", { ifExists: true });
  pgm.dropTable("lesson_members", { ifExists: true });
  pgm.dropTable("lessons", { ifExists: true });
  pgm.dropTable("tutors", { ifExists: true });
  pgm.dropTable("availability_slots", { ifExists: true });
  pgm.dropTable("users", { ifExists: true, cascade: true });
  pgm.dropTable("contact_requests", { ifExists: true });

  // types
  pgm.dropType("user_gender", { ifExists: true });
}
