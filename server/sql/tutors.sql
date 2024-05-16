-- Active: 1715685752059@@127.0.0.1@5432@space@public

DROP TABLE If EXISTS tutors;

CREATE TABLE tutors (
    id SERIAL NOT NULL PRIMARY KEY REFERENCES users (id),
    bio TEXT,
    about TEXT,
    video VARCHAR,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO
    tutors (bio, about, video)
VALUES (
        'my bio',
        'about me',
        'video_url'
    );

UPDATE tutors
SET
    bio = COALESCE($1, bio),
    about = COALESCE($2, about),
    video = COALESCE($3, video),
where
    id = 1;

SELECT *
FROM users
    JOIN tutors on users.id = tutors.id
WHERE
    users.id = tutors.id;