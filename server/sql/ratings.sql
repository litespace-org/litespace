-- Active: 1715685752059@@127.0.0.1@5432@space

CREATE TABLE "ratings" (
    "id" serial UNIQUE PRIMARY KEY NOT NULL,
    "tutor_id" serial NOT NULL REFERENCES users (id),
    "student_id" serial NOT NULL REFERENCES users (id),
    "value" smallint NOT NULL,
    "note" text,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL
);

INSERT INTO
    "ratings" (
        "tutor_id",
        "student_id",
        "value",
        "note",
        "created_at",
        "updated_at"
    )
VALUES (
        2,
        1,
        2,
        null,
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06'
    );

SELECT * FROM "ratings";

SELECT * FROM "tutors";

SELECT
    "id",
    "tutor_id",
    "student_id",
    "value",
    "note",
    "created_at",
    "updated_at"
FROM ratings
WHERE
    tutor_id = 1;

SELECT AVG(ratings.value) as rating, tutors.id as id
FROM tutors
    JOIN ratings on tutors.id = ratings.tutor_id
WHERE
    tutors.id = ratings.tutor_id
GROUP BY
    tutors.id;

UPDATE "ratings"
SET
    value = COALESCE($1, value),
    note = COALESCE($1, note),
WHERE
    id = 1;