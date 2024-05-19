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
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(1000)", notNull: true, unique: true },
    password: { type: "varchar(100)", notNull: true },
    name: { type: "varchar(100)", notNull: true },
    avatar: { type: "varchar(255)" },
    type: { type: "user_type", notNull: true },
  });
  pgm.createTable("tutors", {
    id: {
      type: "serial",
      notNull: true,
      primaryKey: true,
      references: "users(id)",
    },
    bio: { type: "varchar(1000)" },
    about: { type: "text" },
    video: { type: "varchar(255)" },
    authorized_zoom_app: { type: "boolean", notNull: true, default: false },
    zoom_refresh_token: { type: "varchar(1000)" },
    aquired_refresh_token_at: { type: "timestamp" },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("tutors", "id");
  pgm.createIndex("users", "id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
