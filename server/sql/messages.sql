CREATE TABLE "messages" (
    "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
    "user_id" SERIAL NOT NULL REFERENCES users (id),
    "room_id" SERIAL NOT NULL REFERENCES rooms (id),
    "reply_id" INTEGER DEFAULT NULL REFERENCES messages (id),
    "body" VARCHAR(1000) NOT NULL,
    "is_read" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL
);

INSERT INTO
    "messages" (
        "user_id",
        "room_id",
        "reply_id",
        "body",
        "is_read",
        "created_at",
        "updated_at"
    )
VALUES (
        1,
        1,
        1,
        'msg',
        false,
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06',
    )
RETURNING
    "id",
    "user_id",
    "room_id",
    "reply_id",
    "body",
    "is_read",
    'created_at',
    'updated_at';

UPDATE "messages"
SET
    messages.body = COALESCE(1, messages.body),
    messages.is_read = COALESCE(1, messages.is_read),
    messages.updated_at = NOW()
WHERE
    messages.id = 1
RETURNING
    "id",
    "user_id",
    "room_id",
    "reply_id",
    "body",
    "is_read",
    'created_at',
    'updated_at';