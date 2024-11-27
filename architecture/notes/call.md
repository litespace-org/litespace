# Call

Call is a sandbox for a lesson or an interview.

## Database models

```sql
CREATE TABLE calls (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  recording_status call_recording_status DEFAULT idle NOT NULL,
  processing_time INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE call_members (
  user_id SERIAL NOT NULL REFERENCES users(id),
  call_id SERIAL NOT NULL REFERENCES calls(id),
  CONSTRAINT call_members_pkey PRIMARY KEY (user_id, call_id)
);

CREATE TABLE call_events (
  call_id SERIAL NOT NULL REFERENCES calls(id),
  user_id SERIAL NOT NULL REFERENCES users(id),
  event_type call_event NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE lessons (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  start TIMESTAMP NOT NULL,
  duration SMALLINT NOT NULL,
  price INT NOT NULL,
  rule_id SERIAL NOT NULL REFERENCES rules(id),
  call_id INT DEFAULT NULL,
  canceled_by INT DEFAULT NULL REFERENCES users(id),
  canceled_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE lesson_members (
  lesson_id SERIAL NOT NULL REFERENCES lessons(id),
  user_id SERIAL NOT NULL REFERENCES users(id),
);

CREATE TABLE "interviews" (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  start TIMESTAMP NOT NULL,
  interviewer_id SERIAL NOT NULL REFERENCES users(id),
  interviewee_id SERIAL NOT NULL REFERENCES users(id),
  interviewer_feedback TEXT DEFAULT NULL,
  interviewee_feedback TEXT DEFAULT NULL,
  call_id INT DEFAULT NULL REFERENCES calls(id),
  note TEXT DEFAULT NULL,
  level INT DEFAULT NULL,
  status interview_status DEFAULT pending,
  signer INT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## Peer discovery

Peer discovery design diagram can be found [here](/architecture/peer-discovery.plantuml) (outdated).
