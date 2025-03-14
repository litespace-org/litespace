import { BaseTask } from "@/tasks/base";
import { Command } from "commander";
import { lessons } from "@litespace/models";
import { sleep } from "@litespace/utils/time";
import dayjs from "@/lib/dayjs";
import ms from "ms";
import { config } from "@/lib/config";
import { ILesson } from "@litespace/types";
import { router } from "@/lib/router";
import { Web } from "@litespace/utils/routes";

export class Lesson extends BaseTask {
  public readonly interval = ms("10m");

  command() {
    return new Command()
      .name("lesson")
      .description("Notify users about lesson statuses")
      .action(this.action.bind(this));
  }

  async action() {
    while (true) {
      await this.sendTelegramMessage(
        "\\[tasks/lesson] - Identifying lessons requiring user alerts."
      );

      const start = dayjs.utc().add(this.interval);
      const end = start.add(15, "minutes");

      const { list, total } = await lessons.find({
        after: start.toISOString(),
        before: end.toISOString(),
        ratified: true,
        full: true,
        strict: true,
      });

      await this.sendTelegramMessage(
        total === 0
          ? "\\[tasks/lesson] - Found no lessons"
          : `\\[tasks/lesson] - Found ${total} lesson(s)`
      );

      const lessonIds = list.map((lesson) => lesson.id);
      const allMembers = await lessons.findLessonMembers(lessonIds);

      for (const lesson of list) {
        const lessonMembers = allMembers.filter(
          (member) => member.lessonId === lesson.id
        );
        await this.notify(lesson, lessonMembers);
      }

      await this.sendTelegramMessage(
        `\\[tasks/lesson] Done. Next cycle in ${ms(this.interval, { long: true })}`
      );
      await sleep(this.interval);
    }
  }

  async notify(lesson: ILesson.Self, members: ILesson.PopuldatedMember[]) {
    for (const member of members) {
      if (!member.phone || !member.verifiedPhone) continue;

      const otherMember = members.find(
        ({ userId: otherMember }) => otherMember !== member.userId
      );
      if (!otherMember) continue;

      const message = this.formateMessage({
        lessonId: lesson.id,
        start: lesson.start,
        otherMember: otherMember.name,
        currentMember: member.name,
      });

      if (config.env === "staging") {
        await this.sendTelegramMessage(message);
        continue;
      }

      await this.whatsapp.sendMessage(
        this.whatsapp.asWhatsAppId(member.phone),
        { text: message }
      );
    }
  }

  private formateMessage({
    lessonId,
    start,
    otherMember,
    currentMember,
  }: {
    lessonId: number;
    start: string;
    otherMember: string | null;
    currentMember: string | null;
  }) {
    const time = dayjs.utc(start).fromNow();
    const link = router.web({ route: Web.Lesson, id: lessonId, full: true });

    const header = currentMember ? `Hello, ${currentMember}!` : `Hello!`;
    const body = otherMember
      ? `Your lesson with ${otherMember} will start ${time}. `
      : `Your lesson will start ${time}.`;
    const tail = `You can join from here: ${link}`;
    const message = `${header} ${body} ${tail}`;
    return message;
  }
}
