-- Active: 1715685752059@@127.0.0.1@5432@space@public

DROP TABLE If EXISTS tutors;

CREATE TABLE tutors (
    id SERIAL NOT NULL PRIMARY KEY REFERENCES users (id),
    bio TEXT,
    about TEXT,
    video VARCHAR,
    authorized_zoom_app BOOLEAN NOT NULL DEFAULT FALSE,
    zoom_refresh_token TEXT, -- nullable
    aquired_refresh_token_at TIMESTAMP, -- nullable
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO
    tutors (
        bio,
        about,
        video,
        created_at,
        updated_at
    )
VALUES (
        'my bio',
        'about me',
        'video_url',
        '',
        ''
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

SELECT zoom_refresh_token as token FROM tutors WHERE id = 1;

UPDATE tutors
SET
    authorized_zoom_app = true,
    zoom_refresh_token = 'new_token',
where
    id = 1;