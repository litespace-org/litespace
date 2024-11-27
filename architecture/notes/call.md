# Call

Call is a sandbox for a lesson or an interview.

## Database models

- Update lessons, interviews, and calls table schema.

  - `lessons` should have `id`, `call_id`, `start`, `duration`, `created_at`, `updated_at`
  - `interviews` should have `id`, `call_id`, `interviewer_id`, `interviewee`, `start`, `duration`, `created_at`, and `updated_at`
  - `calls` should only have `id`, and `created_at`
    - `call_members` table should include `call_id`, and `user_id`.
    - `call_events` `id`, `call_id`, `event_type`, and `created_at`.

## Peer discovery

Peer discovery design diagram can be found [here](/architecture/peer-discovery.plantuml) (outdated).
