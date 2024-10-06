import { IMessage, IRoom, IUser } from "@litespace/types";
import { Dayjs } from "dayjs";
import { isEmpty, maxBy } from "lodash";
import dayjs from "@/lib/dayjs";

export type Sender = {
  id: number;
  photo: string | null;
  name: string | null;
};

export type MessageGroup = {
  id: string;
  sender: Sender;
  messages: IMessage.Self[];
  date: string;
};

function asSender({
  senderId,
  currentUser,
  members,
}: {
  senderId: number;
  currentUser: IUser.Self;
  members: IRoom.PopulatedMember[];
}): Sender | null {
  if (senderId === currentUser.id)
    return {
      id: currentUser.id,
      name: currentUser.name,
      photo: currentUser.image,
    };

  const member = members.find((member) => member.id === senderId);
  if (!member) return null;
  return {
    id: member.id,
    name: member.name,
    photo: member.photo,
  };
}

function assignGroup({
  senderId,
  members,
  currentUser,
  messages,
}: {
  senderId: number | null;
  members: IRoom.PopulatedMember[];
  currentUser: IUser.Self;
  messages: IMessage.Self[];
}): MessageGroup | null {
  if (isEmpty(messages) || !senderId) return null;
  const sender = asSender({ senderId, currentUser, members });
  if (!sender) return null;

  const latest = maxBy(messages, (message) => dayjs(message.updatedAt).unix());
  if (!latest) return null;

  const id = messages.map((message) => message.id).join("-");
  return { id, sender, messages, date: latest.updatedAt };
}

export function asMessageGroups({
  messages,
  currentUser,
  members,
}: {
  messages: IMessage.Self[];
  currentUser: IUser.Self;
  members: IRoom.PopulatedMember[];
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
        members,
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
    members,
    senderId,
  });
  if (lastGroup) groups.push(lastGroup);
  return groups;
}
