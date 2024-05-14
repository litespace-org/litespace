
DrOP TABLE IF EXISTS users;


CREATE TABLE users (
    name VARCHAR(255)
);


INSERT INTO users(name) VALUES ('jone'), ('doe');

SELECT * FrOM users;