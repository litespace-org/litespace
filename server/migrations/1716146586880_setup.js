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
  pgm.createType("call_type", ["lesson", "interview"]);
  pgm.createType("user_gender_type", ["male", "female"]);
  pgm.createType("plan_cycle", ["month", "quarter", "biannual", "year"]);
  pgm.createType("token_type", ["forgot-password", "verify-email"]);

  // tables
  pgm.createTable("sessions", {
    sid: { type: "CHARACTER VARYING", primaryKey: true, notNull: true },
    sess: { type: "JSON", notNull: true },
    expire: { type: "TIMESTAMP(6) WITHOUT TIME ZONE", notNull: true },
  });

  pgm.createTable("users", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    email: { type: "VARCHAR(50)", notNull: true, unique: true },
    password: { type: "CHAR(64)", default: null },
    name: { type: "VARCHAR(50)", default: null }, // todo: add: name_ar, name_en
    avatar: { type: "VARCHAR(255)", default: null },
    type: { type: "user_type", default: null },
    birth_year: { type: "INT", default: null },
    gender: { type: "user_gender_type", default: null },
    online: { type: "BOOLEAN", notNull: true, default: false },
    verified: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("tokens", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "SERIAL", notNull: true },
    token_hash: { type: "CHAR(64)", notNull: true },
    used: { type: "BOOLEAN", notNull: true, default: false },
    type: { type: "token_type", notNull: true },
    expires_at: { type: "TIMESTAMP", notNull: true },
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
    activated: { type: "BOOLEAN", notNull: true, default: false },
    activated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    passed_interview: { type: "BOOLEAN" },
    interview_url: { type: "VARCHAR(255)" },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
  });

  pgm.createTable("slots", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
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

  pgm.createTable("calls", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    type: { type: "call_type", notNull: true },
    host_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    attendee_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    slot_id: { type: "SERIAL", notNull: true, references: "slots(id)" },
    start: { type: "TIMESTAMPTZ", notNull: true },
    duration: { type: "SMALLINT", notNull: true },
    note: { type: "TEXT" },
    feedback: { type: "TEXT" },
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
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("coupons", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    code: { type: "VARCHAR(255)", notNull: true, unique: true },
    plan_id: { type: "SERIAL", notNull: true, references: "plans(id)" },
    full_month_discount: { type: "INT", notNull: true, default: 0 },
    full_quarter_discount: { type: "INT", notNull: true, default: 0 },
    half_year_discount: { type: "INT", notNull: true, default: 0 },
    full_year_discount: { type: "INT", notNull: true, default: 0 },
    expires_at: { type: "TIMESTAMP", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("invites", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    email: { type: "VARCHAR(50)", notNull: true, unique: true },
    plan_id: { type: "SERIAL", notNull: true, references: "plans(id)" },
    expires_at: { type: "TIMESTAMP", notNull: true },
    accepted_at: { type: "TIMESTAMP" },
    created_at: { type: "TIMESTAMP", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("subscriptions", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    user_id: {
      type: "SERIAL",
      notNull: true,
      references: "users(id)",
      unique: true,
    },
    plan_id: { type: "SERIAL", notNull: true, references: "plans(id)" },
    plan_cycle: { type: "plan_cycle", notNull: true },
    remaining_monthly_minutes: { type: "SMALLINT", notNull: true },
    auto_renewal: { type: "BOOLEAN", notNull: true, default: false },
    start: { type: "TIMESTAMPTZ", notNull: true },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("reports", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    title: { type: "VARCHAR(255)", notNull: true },
    description: { type: "VARCHAR(1000)", notNull: true },
    category: { type: "VARCHAR(255)", notNull: true },
    resolved: { type: "BOOLEAN", notNull: true, default: false },
    resolved_at: { type: "TIMESTAMPTZ" },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("report_replies", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    report_id: { type: "SERIAL", notNull: true, references: "reports(id)" },
    message: { type: "VARCHAR(1000)", notNull: true },
    draft: { type: "BOOLEAN", default: true },
    created_at: { type: "TIMESTAMPTZ", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMPTZ", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("gifts", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    sender_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    receiver_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    value: { type: "INT", notNull: true },
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
  pgm.createIndex("calls", "id");
  pgm.createIndex("slots", "id");
  pgm.createIndex("tutors", "id");
  pgm.createIndex("users", "id");
  pgm.createIndex("tokens", "id");
  pgm.createIndex("ratings", "id");
  pgm.createIndex("plans", "id");
  pgm.createIndex("coupons", "id");
  pgm.createIndex("invites", "id");
  pgm.createIndex("subscriptions", "id");
  pgm.createIndex("reports", "id");
  pgm.createIndex("report_replies", "id");
  pgm.createIndex("gifts", "id");
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
  pgm.dropIndex("plans", "id", { ifExists: true });
  pgm.dropIndex("coupons", "id", { ifExists: true });
  pgm.dropIndex("invites", "id", { ifExists: true });
  pgm.dropIndex("subscriptions", "id", { ifExists: true });
  pgm.dropIndex("report_replies", "id", { ifExists: true });
  pgm.dropIndex("reports", "id", { ifExists: true });
  pgm.dropIndex("gifts", "id", { ifExists: true });
  pgm.dropIndex("ratings", "id", { ifExists: true });
  pgm.dropIndex("calls", "id", { ifExists: true });
  pgm.dropIndex("slots", "id", { ifExists: true });
  pgm.dropIndex("tutors", "id", { ifExists: true });
  pgm.dropIndex("tokens", "id", { ifExists: true });
  pgm.dropIndex("users", "id", { ifExists: true });

  // tables
  pgm.dropTable("messages", { ifExists: true });
  pgm.dropTable("rooms", { ifExists: true });
  pgm.dropTable("subscriptions", { ifExists: true });
  pgm.dropTable("invites", { ifExists: true });
  pgm.dropTable("coupons", { ifExists: true });
  pgm.dropTable("plans", { ifExists: true });
  pgm.dropTable("report_replies", { ifExists: true });
  pgm.dropTable("reports", { ifExists: true });
  pgm.dropTable("gifts", { ifExists: true });
  pgm.dropTable("ratings", { ifExists: true });
  pgm.dropTable("calls", { ifExists: true });
  pgm.dropTable("slots", { ifExists: true });
  pgm.dropTable("tokens", { ifExists: true });
  pgm.dropTable("tutors", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });
  pgm.dropTable("sessions", { ifExists: true });

  // types
  pgm.dropType("token_type", { ifExists: true });
  pgm.dropType("user_type", { ifExists: true });
  pgm.dropType("repeat_type", { ifExists: true });
  pgm.dropType("call_type", { ifExists: true });
  pgm.dropType("user_gender_type", { ifExists: true });
  pgm.dropType("plan_cycle", { ifExists: true });
};
