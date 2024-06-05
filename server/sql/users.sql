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
    avatar TEXT DEFAULT NULL,
    type user_type NOT NULL
);

INSERT INTO
    users (
        email,
        password,
        name,
        avatar,
        type
    )
VALUES (
        'ahmed@litespace.com',
        'LiteSpace1###',
        'Ahmed',
        'my_avatar',
        'super_admin'
    );

INSERT INTO
    users (
        email,
        password,
        name,
        avatar,
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

SELECT id, email, password, name, avatar, type
FROM users
WHERE
    id in (1, 2);

UPDATE users
SET
    avatar = COALESCE('null', avatar)
where
    id = 1;

SELECT id, email, password, name, avatar, type
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
    "avatar",
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
    users.avatar as avatar,
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
    "avatar",
    "type",
    "active",
    "created_at",
    "updated_at"
FROM users;