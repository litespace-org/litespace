-- Active: 1715685752059@@127.0.0.1@5432@space@public

DROP TABLE If EXISTS tutors;

CREATE TABLE tutors (
    id SERIAL NOT NULL PRIMARY KEY REFERENCES users (id),
    bio TEXT NOT NULL,
    about TEXT NOT NULL,
    video VARCHAR NOT NULL
);