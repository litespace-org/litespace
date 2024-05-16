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
    teacher_id SERIAL NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    weekday SMALLINT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    repeat repeat_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);