import { IMessage, IRoom, IUser } from "@litespace/types";
import { Dayjs } from "dayjs";
import { isEmpty, maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

export type DisplayMessage = {
  id: number;
  text: string;
  messageState?: IMessage.MessageState;
  deleted: boolean;
};

export type Sender = {
  userId: number;
  image?: string | null;
  name: string | null;
};

export type MessageGroup = {
  id: string;
  sender: Sender;
  messages: DisplayMessage[];
  sentAt: string;
};

function asSender({
  senderId,
  currentUser,
  otherMember,
}: {
  senderId: number;
  currentUser: IUser.Self;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
}): Sender | null {
  if (senderId === currentUser.id)
    return {
      userId: currentUser.id,
      name: currentUser.name,
      image: currentUser.image,
    };

  return {
    userId: otherMember.id,
    name: otherMember.name,
    image: otherMember.image,
  };
}

function assignGroup({
  senderId,
  otherMember,
  currentUser,
  messages,
}: {
  senderId: number | null;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
  currentUser: IUser.Self;
  messages: IMessage.AttributedMessage[];
}): MessageGroup | null {
  if (isEmpty(messages) || !senderId) return null;
  const sender = asSender({ senderId, currentUser, otherMember });
  if (!sender) return null;

  const latest = maxBy(messages, (message) => dayjs(message.updatedAt).unix());
  if (!latest) return null;

  const id = messages.map((message) => message.id).join("-");

  return {
    id,
    sender,
    messages: messages.map((message) => ({
      id: message.id,
      text: message.text,
      messageState: message.messageState,
      deleted: message.deleted,
    })),
    sentAt: latest.updatedAt,
  };
}

export function asMessageGroups({
  messages,
  currentUser,
  otherMember,
}: {
  messages: IMessage.AttributedMessage[];
  currentUser: IUser.Self;
  otherMember: IRoom.FindUserRoomsApiRecord["otherMember"];
}) {
  const groups: MessageGroup[] = [];

  let senderId: number | null = null;
  let group: IMessage.Self[] = [];
  let start: Dayjs | null = null;

  for (const message of messages) {
    if (!senderId && isEmpty(group)) {
      senderId = message.userId;
      start = dayjs(message.createdAt);
    }

    // message from the same user, push to the same group
    const sameGroup =
      message.userId === senderId &&
      (!start ||
        dayjs(message.createdAt).isBetween(
          start,
          start.add(1, "minutes"),
          "milliseconds",
          "[]"
        ));

    if (sameGroup) {
      group.push(message);
    } else {
      const assignedGroup = assignGroup({
        messages: group,
        currentUser,
        otherMember,
        senderId,
      });
      if (!assignedGroup) continue;
      // append previous group
      groups.push(assignedGroup);
      // create new group
      group = [message];
      senderId = message.userId;
      start = dayjs(message.createdAt);
    }
  }

  const lastGroup = assignGroup({
    messages: group,
    currentUser,
    otherMember,
    senderId,
  });
  if (lastGroup) groups.push(lastGroup);
  return groups;
}
