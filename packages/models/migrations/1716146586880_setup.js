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
  pgm.createType("user_role", [
    "super-admin",
    "reg-admin",
    "tutor",
    "student",
    "interviewer",
    "media-provider",
  ]);
  pgm.createType("call_event", ["join", "leave"]);
  pgm.createType("call_recording_status", [
    "idle",
    "recording",
    "recorded",
    "queued",
    "empty",
    "processing",
    "processed",
    "processing-failed",
  ]);
  pgm.createType("user_gender", ["male", "female"]);
  pgm.createType("plan_cycle", ["month", "quarter", "biannual", "year"]);
  pgm.createType("interview_status", [
    "pending",
    "passed",
    "rejected",
    "canceled",
  ]);
  pgm.createType("withdraw_method", ["wallet", "bank", "instapay"]);
  pgm.createType("invoice_status", [
    "pending",
    "updated-by-receiver",
    "canceled-by-receiver",
    "canceled-by-admin",
    "cancellation-approved-by-admin",
    "fulfilled",
    "rejected",
  ]);

  // tables
  pgm.createTable("users", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    email: { type: "VARCHAR(50)", notNull: true, unique: true },
    password: { type: "CHAR(64)", default: null },
    name: { type: "VARCHAR(50)", default: null },
    image: { type: "VARCHAR(255)", default: null },
    role: { type: "user_role", default: null },
    birth_year: { type: "INT", default: null },
    gender: { type: "user_gender", default: null },
    online: { type: "BOOLEAN", notNull: true, default: false },
    verified: { type: "BOOLEAN", notNull: true, default: false },
    phone_number: { type: "VARCHAR(15)", default: null },
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

  pgm.createTable("rules", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    title: { type: "VARCHAR(255)", notNull: true },
    frequency: { type: "SMALLINT", notNull: true },
    start: { type: "TIMESTAMP", notNull: true },
    end: { type: "TIMESTAMP", notNull: true },
    time: { type: "CHAR(5)", notNull: true },
    duration: { type: "SMALLINT", notNull: true },
    weekdays: { type: "JSONB", notNull: true, default: "[]" },
    monthday: { type: "SMALLINT" },
    activated: { type: "BOOLEAN", notNull: true, default: true },
    deleted: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("calls", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    recording_status: {
      type: "call_recording_status",
      notNull: true,
      default: "idle",
    },
    processing_time: { type: "INT", default: null },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable(
    "call_members",
    {
      call_id: { type: "SERIAL", notNull: true, references: "calls(id)" },
      user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    },
    { constraints: { primaryKey: ["call_id", "user_id"] } }
  );

  pgm.createTable("call_events", {
    call_id: { type: "SERIAL", notNull: true, references: "calls(id)" },
    user_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    event_type: { type: "call_event", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("lessons", {
    id: { type: "SERIAL", primaryKey: true, notNull: true, unique: true },
    start: { type: "TIMESTAMP", notNull: true },
    duration: { type: "SMALLINT", notNull: true },
    price: { type: "INT", notNull: true },
    rule_id: { type: "SERIAL", references: "rules(id)", notNull: true },
    call_id: { type: "SERIAL", notNull: true, reference: "calls(id)" },
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
    call_id: { type: "SERIAL", notNull: true, reference: "calls(id)" },
    rule_id: { type: "SERIAL", references: "rules(id)", notNull: true },
    note: { type: "TEXT", default: null },
    level: { type: "INT", default: null },
    status: { type: "interview_status", default: "pending" },
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
    start: { type: "TIMESTAMP", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("reports", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    title: { type: "VARCHAR(255)", notNull: true },
    description: { type: "VARCHAR(1000)", notNull: true },
    category: { type: "VARCHAR(255)", notNull: true },
    resolved: { type: "BOOLEAN", notNull: true, default: false },
    resolved_at: { type: "TIMESTAMP" },
    created_at: { type: "TIMESTAMP", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("report_replies", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    report_id: { type: "SERIAL", notNull: true, references: "reports(id)" },
    message: { type: "VARCHAR(1000)", notNull: true },
    draft: { type: "BOOLEAN", default: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    created_by: { type: "SERIAL", notNull: true, references: "users(id)" },
    updated_at: { type: "TIMESTAMP", notNull: true },
    updated_by: { type: "SERIAL", notNull: true, references: "users(id)" },
  });

  pgm.createTable("gifts", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    sender_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    receiver_id: { type: "SERIAL", notNull: true, references: "users(id)" },
    value: { type: "INT", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

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

  pgm.createTable("withdraw_methods", {
    type: {
      type: "withdraw_method",
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    min: { type: "INT", notNull: true },
    max: { type: "INT", notNull: true },
    enabled: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createTable("invoices", {
    id: { type: "SERIAL", primaryKey: true, unique: true, notNull: true },
    user_id: { type: "INT", references: "users(id)", notNull: true },
    method: { type: "withdraw_method", notNull: true },
    receiver: { type: "VARCHAR(255)", notNull: true },
    bank: { type: "VARCHAR(5)" },
    amount: { type: "INT", notNull: true },
    update: { type: "JSONB", default: null },
    note: { type: "TEXT", default: null },
    status: { type: "invoice_status", notNull: true, default: "pending" },
    receipt: { type: "VARCHAR(255)", default: null },
    addressed_by: { type: "INT", references: "users(id)" },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMeSTAMP", notNull: true },
  });

  // indexes
  pgm.createIndex("calls", "id");
  pgm.createIndex("lessons", "id");
  pgm.createIndex("rules", "id");
  pgm.createIndex("tutors", "id");
  pgm.createIndex("users", "id");
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
  pgm.createIndex("invoices", "id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // indexes
  pgm.dropIndex("invoices", "id", { ifExists: true });
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
  pgm.dropIndex("lessons", "id", { ifExists: true });
  pgm.dropIndex("calls", "id", { ifExists: true });
  pgm.dropIndex("rules", "id", { ifExists: true });
  pgm.dropIndex("tutors", "id", { ifExists: true });
  pgm.dropIndex("users", "id", { ifExists: true });

  // tables
  pgm.dropTable("user_topics", { ifExists: true });
  pgm.dropTable("topics", { ifExists: true });
  pgm.dropTable("withdraw_methods", { ifExists: true });
  pgm.dropTable("invoices", { ifExists: true });
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
  pgm.dropTable("call_events", { ifExists: true });
  pgm.dropTable("call_members", { ifExists: true });
  pgm.dropTable("calls", { ifExists: true });
  pgm.dropTable("rules", { ifExists: true });
  pgm.dropTable("tutors", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });

  // types
  pgm.dropType("user_role", { ifExists: true });
  pgm.dropType("user_gender", { ifExists: true });
  pgm.dropType("plan_cycle", { ifExists: true });
  pgm.dropType("call_event", { ifExists: true });
  pgm.dropType("interview_status", { ifExists: true });
  pgm.dropType("call_recording_status", { ifExists: true });
  pgm.dropType("withdraw_method", { ifExists: true });
  pgm.dropType("invoice_status", { ifExists: true });
};
