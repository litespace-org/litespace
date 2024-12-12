# Chat

## Chat rooms management

- When the user is connected to the server, we find all his rooms and _join_ his socket to it.
- When the user is disconnected from the server, we find all his rooms and _remove_ his socket from these rooms.
  - Notify his room members in these rooms that the user is offline ([related](#onlineoffline))

## Online/Offline

> Depends on (blocked by) [chat rooms management](#chat-rooms-management).

##### Requirements

When the user is connected/disconnected to/from the server

- He should be marked as `online` / `offline`
- All the other users that share a room with the current user should be notified.
- Logic should be tested.

## Mark messages as read

> Depends on (blocked by) [chat rooms management](#chat-rooms-management).

##### Requirements

- When the message first created it should be marked as unread by default.
- Onwership must be verified.
- Ensure the the messages was not already deleted.
- Client can emit an event to mark message as read.
- Upon failure, a revert event should be sent back to the same client to notify that the action was reverted.
- Logic should be tested.

## Delete message

> Depends on (blocked by) [chat rooms management](#chat-rooms-management).

##### Requirements

- Client can emit an event to delete a room message in case he is the owner.
  - Event should contain the message id only.
- Onwership must be verified.
- Ensure that messages was not already deleted.
- Messages should be never be deleted from the database but it should be _marked as deleted_ instead.
- Ensure that deleted messages is not included in the the find room messages api handler.
- Upon deletion failure, an event should be sent back to the same client with the revert reason.
  ```ts
  // event emitted by the server to the chat room associated with the deleted messages.
  type MessageDeletionReverted = {
    messageId: number;
    reason: string;
  };
  ```
- Other members in the room should notified that the message was deleted.
  ```ts
  // event emitted by the server to the chat room associated with deleted message.
  type MessagedDeleted = { messageId: number };
  ```

## Tasks

- [ ] Write full-test coverage for the `messages` model. @mmoehabb
- [ ] Chat room management ([info](#chat-rooms-management)). @mmoehabb
- [ ] Online/Offline ([info](#onlineoffline)) @mmoehabb
- [ ] Mark message as read ([info](#mark-messages-as-read)). @mmoehabb
- [ ] Delete messages ([info](#delete-message)). @mmoehabb
