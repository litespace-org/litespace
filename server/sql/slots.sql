-- Active: 1715685752059@@127.0.0.1@5432@space@public

DROP TABLE IF EXISTS slots;

DROP TYPE IF EXISTS repeat_type;

CREATE TYPE repeat_type as ENUM(
    'no_repeat',
    'daily',
    'every_week',
    'every_month'
);

CREATE TABLE slots (
    id SERIAL NOT NULL PRIMARY KEY,
    tutor_id SERIAL NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    weekday SMALLINT NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    repeat repeat_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO
    slots (
        tutor_id,
        title,
        description,
        weekday,
        start_time,
        end_time,
        repeat,
        start_date,
        end_date,
        created_at,
        updated_at
    )
VALUES (
        '1',
        'First slot',
        'first description',
        '0',
        '00:00:00',
        '24:00:00',
        'no_repeat',
        '1999-01-08',
        '1999-01-09',
        '1999-01-08 04:05:06',
        '1999-01-08 04:05:06'
    );

UPDATE slots
SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    weekday = COALESCE($3, weekday),
    start_time = COALESCE($4, start_time),
    end_time = COALESCE($5, end_time),
    repeat = COALESCE($6, repeat),
    start_date = COALESCE($7, start_date),
    end_date = COALESCE($8, end_date),
    updated_at = COALESCE($9, updated_at)
where
    id = $10;

DELETE FROM slots WHERE id = 1;

SELECT * FROM slots;

SELECT
    id,
    tutor_id,
    title,
    description,
    weekday,
    start_time,
    end_time,
    repeat,
    start_date,
    end_date,
    created_at,
    updated_at
FROM slots
WHERE
    id = 1;