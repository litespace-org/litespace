-- Active: 1715685752059@@127.0.0.1@5432@space

CREATE TYPE "renewal_interval_type" AS ENUM(
    'no',
    'montly',
    'quarterly',
    'yearly'
);

CREATE TABLE "subscriptions" (
    "id" serial UNIQUE PRIMARY KEY NOT NULL,
    "student_id" serial UNIQUE NOT NULL REFERENCES users (id),
    "monthly_minutes" smallint NOT NULL,
    "remaining_minutes" smallint NOT NULL,
    "auto_renewal" boolean NOT NULL,
    "start" timestamptz NOT NULL,
    "end" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL
);

INSERT INTO
    "subscriptions" (
        "student_id",
        "monthly_minutes",
        "remaining_minutes",
        "auto_renewal",
        "start",
        "end",
        "created_at",
        "updated_at"
    )
VALUES (
        1,
        1,
        1,
        true,
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06'
    );

UPDATE "subscriptions" as s
SET
    "monthly_minutes" = COALESCE(100, s.monthly_minutes),
    "remaining_minutes" = COALESCE(null, s.remaining_minutes),
    "auto_renewal" = COALESCE(null, s.auto_renewal),
    "start" = COALESCE(null, s.start),
    "end" = COALESCE(null, s.end),
    "updated_at" = NOW()
WHERE
    id = 1;

SELECT
    "id",
    "student_id",
    "monthly_minutes",
    "remaining_minutes",
    "auto_renewal",
    "start",
    "end",
    "created_at",
    "updated_at"
FROM "subscriptions"
WHERE
    id = $1;