-- Active: 1715685752059@@127.0.0.1@5432@space

CREATE TABLE "rooms" (
    "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
    "tutor_id" SERIAL NOT NULL REFERENCES users (id),
    "student_id" SERIAL NOT NULL REFERENCES users (id),
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

INSERT INTO
    "rooms" (
        "tutor_id",
        "student_id",
        "created_at",
        "updated_at"
    )
VALUES (2, 3, NOW(), NOW());

SELECT * FROM "rooms";

SELECT
    "id",
    "tutor_id",
    "student_id",
    "created_at",
    "updated_at"
FROM "rooms"
WHERE
    "tutor_id" = 1
    AND "student_id" = 2;

SELECT
    "id",
    "tutor_id",
    "student_id",
    "created_at",
    "updated_at"
FROM "rooms"
WHERE
    CASE
        WHEN 'undefined' = 'no-value' THEN "tutor_id" = 2
        ELSE "student_id" = 2
    END;