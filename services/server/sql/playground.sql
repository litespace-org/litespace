-- Active: 1717007169769@@127.0.0.1@5432@litespace

DROP TABLE IF EXISTS tutors;

DROP TABLE IF EXISTS slots;

DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS user_type;

CREATE TYPE user_type as ENUM(
    'super_admin',
    'reg_admin',
    'tutor',
    'student'
)

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    photo TEXT DEFAULT NULL,
    type user_type NOT NULL
);

INSERT INTO
    users (
        email,
        password,
        name,
        photo,
        type
    )
VALUES (
        'ahmed@litespace.com',
        'LiteSpace1###',
        'Ahmed',
        'photo',
        'super_admin'
    );

INSERT INTO
    users (
        email,
        password,
        name,
        photo,
        type,
        created_at,
        updated_at
    )
values (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW()
    )
RETURNING
    id;

SELECT * FrOM users;

SELECT id, email, password, name, photo, type
FROM users
WHERE
    id in (1, 2);

UPDATE users
SET
    photo = COALESCE('null', photo)
where
    id = 1;

SELECT id, email, password, name, photo, type
FROM users
WHERE
    email = 'ahmed@litespace.com'
    AND password = 'pass_0';

INSERT INTO
    "users" ("email", "type")
values ($1, $2)
RETURNING
    "id",
    "email",
    "name",
    "photo",
    "type",
    "active",
    "created_at",
    "updated_at";

SELECT * FROM "sessons";

UPDATE users
SET
    type = COALESCE(null, type),
    updated_at = NOW()
where
    id = 1;

SELECT * FROM users;

SELECT
    users.id as id,
    users.email as email,
    users.name as name,
    users.photo as photo,
    users.gender as gender,
    users.active as active,
    users.created_at as created_at,
    users.updated_at as updated_at,
    tutors.bio as bio,
    tutors.about as about,
    tutors.video as video,
    tutors.updated_at as meta_updated_at
FROM users
    JOIN tutors on users.id = tutors.id
WHERE
    users.id = tutors.id;

SELECT
    "id",
    "email",
    "password",
    "name",
    "photo",
    "type",
    "active",
    "created_at",
    "updated_at"
FROM users;

INSERT INTO
    "zoom_accounts" (
        "email",
        "account_id",
        "client_id",
        "client_secret"
    )
VALUES ('test@test.io', '1', '2', '3')
RETURNING
    "id",
    "email",
    "account_id",
    "client_id",
    "client_secret",
    "remaining_api_calls",
    "created_at",
    "updated_at";

UPDATE "zoom_accounts"
SET
    remaining_api_calls = remaining_api_calls - 1
WHERE
    id = 2;

SELECT
    "id",
    "email",
    "account_id",
    "client_id",
    "client_secret",
    "remaining_api_calls",
    "created_at",
    "updated_at"
FROM "zoom_accounts"
WHERE
    zoom_accounts.id = 2;

SELECT
    "id",
    "email",
    "account_id",
    "client_id",
    "client_secret",
    "created_at",
    "updated_at",
    MAX("remaining_api_calls") as "remaining_api_calls"
FROM "zoom_accounts"
GROUP BY
    "id"
ORDER BY "remaining_api_calls" DESC
LIMIT 1;

-- Calls

INSERT INTO
    "calls" (
        "type",
        "host_id",
        "attendee_id",
        "slot_id",
        "zoom_meeting_id",
        "system_zoom_account_id",
        "start",
        "duration",
        "meeting_url"
    )
VALUES ()
RETURNING
    "id",
    "type",
    "host_id",
    "attendee_id",
    "slot_id",
    "zoom_meeting_id",
    "system_zoom_account_id",
    "start",
    "duration",
    "meeting_url",
    "created_at",
    "updated_at";

-- Calls

SELECT * FROM calls;