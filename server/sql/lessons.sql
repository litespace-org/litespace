-- Active: 1715685752059@@127.0.0.1@5432@space@public

CREATE TABLE "lessons" (
    "id" serial UNIQUE PRIMARY KEY NOT NULL,
    "tutor_id" serial NOT NULL REFERENCES users (id),
    "student_id" serial NOT NULL REFERENCES users (id),
    "slot_id" serial NOT NULL REFERENCES slots (id),
    "zoom_meeting_id" bigint UNIQUE NOT NULL,
    "start" timestamp NOT NULL,
    "end" timestamp NOT NULL,
    "meeting_url" varchar(255) NOT NULL,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL
);

INSERT INTO
    "lessons" (
        tutor_id,
        student_id,
        slot_id,
        zoom_meeting_id,
        start,
        end,
        meeting_url,
        created_at,
        updated_at,
    )
VALUES (
        1,
        2,
        3,
        4,
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06',
        'https://...',
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06',
    );

SELECT
    "id",
    "tutor_id",
    "student_id",
    "slot_id",
    "zoom_meeting_id",
    "start",
    "end",
    "meeting_url",
    "created_at",
    "updated_at"
FROM "lessons"
WHERE
    id = 1;