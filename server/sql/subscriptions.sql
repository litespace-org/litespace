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
    "renewal_interval" renewal_interval_type NOT NULL,
    "start" timestamptz NOT NULL,
    "end" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL
);

INSERT INTO
    "subscriptions" (
        "student_id",
        "montly_minutes",
        "remaining_minutes",
        "renewal_interval",
        "start",
        "end",
        "created_at",
        "updated_at"
    )
VALUES (
        1,
        1,
        1,
        'no',
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06'
    );

UPDATE "subscriptions"
SET
    montly_minutes = COALESCE($1, montly_minutes),
    remaining_minutes = COALESCE($1, remaining_minutes),
    renewal_interval = COALESCE($1, renewal_interval),
    start = COALESCE($1, start),
    end = COALESCE($1, end),
    updated_at = NOW()
WHERE
    id = 1;

SELECT
    "id",
    "student_id",
    "montly_minutes",
    "remaining_minutes",
    "renewal_interval",
    "start",
    "end",
    "created_at",
    "updated_at"
FROM "subscriptions"
WHERE
    id = $1;