import { atlas, backendUrl } from "@/lib/atlas";
import { ISlot, ITutor, IUser, as } from "@litespace/types";
import { DataProvider, GetListParams } from "@refinedev/core";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { selectUpdatedOrNone } from "@/lib/utils";

export enum Resource {
  UserTypes = "user-types",
  Users = "users",
  Tutors = "tutors",
  MySchedule = "my-schedule",
  MyInterviews = "my-interviews",
}

const empty = { data: null };

export const dataProvider: DataProvider = {
  async getOne({ resource, id }) {
    const resourceId = as.int(id);
    if (resource === Resource.Users) {
      const user = await atlas.user.findById(resourceId);
      return { data: as.casted(user) };
    }

    if (resource === Resource.Tutors) {
      const tutor = await atlas.tutor.findById(resourceId);
      return { data: as.casted(tutor) };
    }

    if (resource === Resource.MySchedule) {
      const slot = await atlas.slot.findById(resourceId);
      return { data: as.casted(slot) };
    }

    if (resource === Resource.MyInterviews) {
      const call = await atlas.call.findHostCallById(resourceId);
      return { data: as.casted(call) };
    }

    throw new Error("Not implemented");
  },
  async update({ id, resource, variables, meta }) {
    const resourceId = as.int(id);
    if (resource === Resource.Users && meta) {
      const prev = as.casted<IUser.Self>(meta.user);
      const { name, email, password, avatar, bithday, gender, type } =
        as.casted<
          Partial<{
            name: string;
            email: string;
            password: string;
            avatar: string;
            bithday: Dayjs;
            gender: IUser.Gender;
            type: IUser.Type;
          }>
        >(variables);
      await atlas.user.update({
        name: selectUpdatedOrNone(prev.name, name),
        email: selectUpdatedOrNone(prev.email, email),
        password,
        avatar: selectUpdatedOrNone(prev.avatar, avatar),
        birthday: bithday
          ? selectUpdatedOrNone(prev.birthday, bithday.format("YYYY-MM-DD"))
          : undefined,
        gender: selectUpdatedOrNone(prev.gender, gender),
        type: selectUpdatedOrNone(prev.type, type),
        id: resourceId,
      });
      return { data: as.casted(null) };
    }

    if (resource === Resource.Tutors) {
      const {
        uBio,
        uAbout,
        uVideo,
        uActivate,
        uPassedInterview,
        uInterviewUrl,
      } = as.casted<{
        uBio: string;
        uAbout: string;
        uVideo: string;
        uActivate: boolean;
        uPassedInterview: boolean;
        uPrivateFeedback: string;
        uPublicFeedback: string;
        uInterviewUrl: string;
      }>(variables);

      await atlas.tutor.update(resourceId, {
        bio: uBio,
        about: uAbout,
        video: uVideo,
        activated: uActivate,
        passedInterview: uPassedInterview,
        interviewUrl: uInterviewUrl,
      });

      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  create: async ({ resource, variables, meta }) => {
    if (resource === Resource.Users) {
      await atlas.user.create(as.casted(variables));
      return as.casted(empty);
    }

    if (resource === Resource.MySchedule) {
      const {
        date: [startDate, endDate],
        endTime,
        startTime,
        repeat,
        title,
        weekday,
      } = as.casted<{
        date: [Dayjs, Dayjs?];
        endTime: Dayjs;
        startTime: Dayjs;
        repeat: ISlot.Repeat;
        title: string;
        weekday: number;
      }>(variables);

      await atlas.slot.create({
        title,
        time: {
          start: dayjs(startTime, "Africa/Cairo").utc().format("HH:mm:00"),
          end: dayjs(endTime, "Africa/Cairo").utc().format("HH:mm:00"),
        },
        date: {
          start: startDate.tz("Africa/Cairo").format("YYYY-MM-DD"),
          end: endDate?.tz("Africa/Cairo").format("YYYY-MM-DD"),
        },
        repeat,
        weekday,
      });
      return as.casted(empty);
    }

    if (resource === Resource.Tutors) {
      const payload = as.casted<ITutor.CreateApiPayload>(variables);
      const response = await atlas.tutor.create(payload);
      return { data: as.casted(response) };
    }

    throw new Error("Not implemented");
  },
  deleteOne: async ({ resource, id }) => {
    const resourceId = as.int(id);

    if (resource === Resource.MySchedule) {
      await atlas.slot.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Tutors) {
      await atlas.tutor.delete(resourceId);
      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  getList: async ({ resource, meta }: GetListParams) => {
    if (resource === Resource.UserTypes) {
      const list = [
        { label: "Super Admin", value: "super_admin" },
        { label: "Examiner", value: "examiner" },
      ];

      return {
        data: as.any(list),
        total: list.length,
      };
    }

    if (resource === Resource.MySchedule) {
      const slots = await atlas.slot.findMySlots();
      const calls = await atlas.call.findMyCalls();

      return {
        data: as.casted([{ slots, calls }]),
        total: 0,
      };
    }

    if (resource === Resource.Users) {
      const list = await atlas.user.list();
      return { data: as.any(list), total: list.length };
    }

    if (resource === Resource.Tutors) {
      const list = await atlas.tutor.findAll();
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.MyInterviews) {
      const id = meta?.id;
      if (!id) return { data: as.casted([]), total: 0 };

      const hostId = as.int(id);
      const list = await atlas.call.findHostCalls(hostId);
      return { data: as.casted(list), total: list.length };
    }

    throw new Error("Not implemented");
  },
  getApiUrl: () => backendUrl,
};
