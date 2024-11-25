# Chat

## Interafce & Components

**Note:** Components should be implemented first at luna (with storybooks)

- [ ] Impl. [chat component](https://www.figma.com/design/4SwhwulDQ3eEDqevWprW9E/LiteSpace?node-id=1630-53771&t=mukSSDJcjSRP07Nw-4) 
  - Default, hover, and Active
  - Read and unread messages
  - Show count of unread messages
  - Show actions menu.
- [ ] Impl. [Message Group](https://www.figma.com/design/4SwhwulDQ3eEDqevWprW9E/LiteSpace?node-id=1648-55795&t=mukSSDJcjSRP07Nw-4) component   
    ```ts
    interface Props {
      messages: Array<{text: string[], createdAt: string}>;
      username: string | null;
      image: string | null;
    }
    
    ```
  - It should accept username, image, and a list of messages. 
  - It should has two variants `sender` or `receiver`  
  - It should sort message by their time and render them accordingly.
  - Renedered message date should be the time for the **oldest** message.
- [ ] Render pinned and all rooms
- [ ] Render current room messages using the `useMessages` (packages/luna/src/hooks/chat.ts) hook
  - [ ] Reflect selected room
- [ ] Search rooms (error, loading, data)
- [ ] Reflect writing now events. 
  
## Server 
- [ ] Filter user rooms by keyword search  - review by @ahmed 
  - Extend the find user rooms api endpoint to accept a new `search` query.
  - The `search` query should be tested against
    - Other member username (e.g., tutor name or student name)
    - Message text
- [ ] Find user rooms api endpoint should return the latest message in the room and the count of unread messages.
  ```ts
  type FindUserRoomsApiResponse = Paginated<{
   room: number; // room id
   // other member in the room 
   // note: don't return the entire member information as 
   // not all information cannot be shared with the client.
   pinned: boolean;
   muted: boolean;
   otherMember: {
     name: string | null,
     online: boolean;
     role: IUser.Role;
     // Last seen timestamp. Used to indicate user activity.
     updated_at: string;
   }, 
   unreadMessagesCount: number;
   latestMessage: IMessage.Self | null; // latest message can be null incase users didn't exchange any mesasges yet.
  }>
  ```
- [ ] Writing now events 
  - Client emit `UserStartedTyping` and `UserStoppedTyping`
    ```ts
    interface EventPayload {
     room: number 
    };
    
    // example
    socket.emit(Wss.Client.UserStartedTyping, {room})
    socket.emit(Wss.Client.UserStopedTyping, {room})
    ```
  - Server broadcast to the other users in the room.
    ```ts
    function onUserStartedTyping({room}) {
      this.socket.to(room.toString()).emit(Wss.Server.UserStartedTyping, { user, roomt })
    }
    
    function onUserStoppedTyping({room}) {
      this.socket.to(room.toString()).emit(Wss.Server.UserStoppedTyping, { user, roomt })
    }
    ```
  