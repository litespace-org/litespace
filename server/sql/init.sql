DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS user_type;

CREATE TYPE user_type as ENUM(
    'super_admin',
    'reg_admin',
    'teacher',
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
        'pass_0',
        'Ahmed',
        'my_avatar',
        'super_admin'
    ),
    (
        'ibrahim@litespace.com',
        'pass_1',
        'Ibrahim',
        'my_avatar',
        'reg_admin'
    ),
    (
        'mahmoud@litespace.com',
        'pass_3',
        'Mahmoud',
        'my_avatar',
        'student'
    ),
    (
        'ali@litespace.com',
        'pass_4',
        'Ali',
        'my_avatar',
        'teacher'
    );

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