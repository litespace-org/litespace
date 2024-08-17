import { atlas, backendUrl } from "@/lib/atlas";
import {
  ICoupon,
  IInterview,
  IInvite,
  IPlan,
  IReport,
  IReportReply,
  ISlot,
  ITutor,
  IUser,
  as,
} from "@litespace/types";
import { DataProvider, GetListParams } from "@refinedev/core";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { selectUpdatedOrNone } from "@/lib/utils";
import { merge, omit } from "lodash";
import zod from "zod";

export enum Resource {
  UserTypes = "user-types",
  Users = "users",
  Tutors = "tutors",
  MySchedule = "my-schedule",
  MyInterviews = "my-interviews",
  TutorsMedia = "tutors-media",
  Plans = "plans",
  Coupons = "coupons",
  Invites = "invites",
  Reports = "reports",
  ReportReplies = "ReportReplies",
  Assets = "assets",
}

const empty = { data: null };
const getOneData = <T>(data: T) => ({ data: as.any(data) });
const getListData = <T>(data: T, total: number) => ({
  data: as.any(data),
  total,
});
const updateDate = () => as.any({ data: null });

export const dataProvider: DataProvider = {
  async getOne({ resource, id, meta }) {
    const resourceId = zod.coerce.number().parse(id);
    if (resource === Resource.Users) {
      const user = await atlas.user.findById(resourceId);
      return { data: as.casted(user) };
    }

    if (resource === Resource.Tutors) {
      const tutor = await atlas.tutor.findById(resourceId);
      return { data: as.casted(tutor) };
    }

    if (resource === Resource.TutorsMedia) {
      const media = await atlas.tutor.findTutorMedaiById(resourceId);
      return { data: as.casted(media) };
    }

    if (resource === Resource.MySchedule) {
      const slot = await atlas.slot.findById(resourceId);
      return { data: as.casted(slot) };
    }

    if (resource === Resource.MyInterviews) {
      const interview = await atlas.interview.findInterviewById(resourceId);
      if (meta?.interviewOnly) return getOneData(interview);
      const interviewee = await atlas.user.findById(interview.ids.interviewee);
      const call = await atlas.call.findById(interview.ids.call);
      return getOneData({
        interview,
        interviewee,
        call,
      });
    }

    if (resource === Resource.Plans) {
      const plan = await atlas.plan.findById(resourceId);
      return { data: as.casted(plan) };
    }

    if (resource === Resource.Coupons) {
      const coupon = await atlas.coupon.findById(resourceId);
      return { data: as.casted(coupon) };
    }

    if (resource === Resource.Invites) {
      const invite = await atlas.invite.findById(resourceId);
      return { data: as.casted(invite) };
    }

    if (resource === Resource.Reports) {
      const report = await atlas.report.findById(resourceId);
      return { data: as.casted(report) };
    }

    if (resource === Resource.ReportReplies) {
      const reportReply = await atlas.reportReply.findById(resourceId);
      return { data: as.casted(reportReply) };
    }

    throw new Error("Not implemented");
  },
  async update({ id, resource, variables, meta }) {
    const resourceId = zod.coerce.number().parse(id);
    if (resource === Resource.Users && meta) {
      const prev = as.casted<IUser.Self>(meta.user);
      const updated = as.casted<
        Partial<{
          name: string;
          email: string;
          password: string;
          photo: string;
          userBirthday: Dayjs;
          gender: IUser.Gender;
          role: IUser.Role;
        }>
      >(variables);
      await atlas.user.update(resourceId, {
        name: selectUpdatedOrNone(prev.name, updated.name),
        email: selectUpdatedOrNone(prev.email, updated.email),
        password: updated.password,
        photo: selectUpdatedOrNone(prev.photo, updated.photo),
        // birthday: updated.userBirthday
        //   ? selectUpdatedOrNone(
        //       prev.birthday,
        //       updated.userBirthday.format("YYYY-MM-DD")
        //     )
        //   : undefined,
        gender: selectUpdatedOrNone(prev.gender, updated.gender),
        role: selectUpdatedOrNone(prev.role, updated.role),
      });
      return { data: as.casted(null) };
    }

    if (resource === Resource.Tutors && meta) {
      const prev = as.casted<ITutor.FullTutor>(meta.tutor);
      const updated = as.casted<
        Partial<{
          name: string;
          email: string;
          password: string;
          photo: string;
          userBirthday: Dayjs;
          gender: IUser.Gender;
          bio: string;
          about: string;
          video: string;
          activated: boolean;
          passedInterview: boolean;
          dropPhoto?: boolean;
          dropVideo?: boolean;
        }>
      >(variables);

      await atlas.tutor.update(resourceId, {
        name: selectUpdatedOrNone(prev.name, updated.name),
        email: selectUpdatedOrNone(prev.email, updated.email),
        password: updated.password,
        photo: selectUpdatedOrNone(prev.photo, updated.photo),
        // birthday: updated.userBirthday
        //   ? selectUpdatedOrNone(
        //       prev.birthday,
        //       updated.userBirthday.format("YYYY-MM-DD")
        //     )
        //   : undefined,
        gender: selectUpdatedOrNone(prev.gender, updated.gender),
        bio: selectUpdatedOrNone(prev.bio, updated.bio),
        about: selectUpdatedOrNone(prev.about, updated.about),
        video: selectUpdatedOrNone(prev.video, updated.video),
        activated: selectUpdatedOrNone(prev.activated, updated.activated),
        passedInterview: selectUpdatedOrNone(
          prev.passedInterview,
          updated.passedInterview
        ),
      });

      return as.casted(empty);
    }

    if (resource === Resource.TutorsMedia && meta && meta.drop) {
      const drop = zod
        .object({
          photo: zod.boolean(),
          video: zod.boolean(),
        })
        .parse(meta.drop);
      await atlas.user.update(resourceId, { drop });
      return updateDate();
    }

    if (resource === Resource.TutorsMedia) {
      const { photo, video } = zod
        .object({
          photo: zod.union([zod.null(), zod.instanceof(File)]),
          video: zod.union([zod.null(), zod.instanceof(File)]),
        })
        .parse(variables);
      await atlas.user.updateMedia(resourceId, {
        photo: photo || undefined,
        video: video || undefined,
      });
      return updateDate();
    }

    if (resource === Resource.Plans && meta && meta.plan) {
      const prev = as.casted<IPlan.Attributed>(meta.plan);
      const updated = as.casted<{
        hours: number;
        minutes: number;
        fullMonthPrice: number;
        fullQuarterPrice: number;
        halfYearPrice: number;
        fullYearPrice: number;
        fullMonthDiscount: number;
        fullQuarterDiscount: number;
        halfYearDiscount: number;
        fullYearDiscount: number;
        forInvitesOnly: boolean;
        active: boolean;
      }>(variables);

      const weeklyMinutes = updated.hours * 60 + updated.minutes;

      await atlas.plan.update(resourceId, {
        weeklyMinutes: selectUpdatedOrNone(prev.weeklyMinutes, weeklyMinutes),
        fullMonthPrice: selectUpdatedOrNone(
          prev.fullMonthPrice,
          updated.fullMonthPrice
        ),
        fullQuarterPrice: selectUpdatedOrNone(
          prev.fullQuarterPrice,
          updated.fullQuarterPrice
        ),
        halfYearPrice: selectUpdatedOrNone(
          prev.halfYearPrice,
          updated.halfYearPrice
        ),
        fullYearPrice: selectUpdatedOrNone(
          prev.fullYearPrice,
          updated.fullYearPrice
        ),
        fullMonthDiscount: selectUpdatedOrNone(
          prev.fullMonthDiscount,
          updated.fullMonthDiscount
        ),
        fullQuarterDiscount: selectUpdatedOrNone(
          prev.fullQuarterDiscount,
          updated.fullQuarterDiscount
        ),
        halfYearDiscount: selectUpdatedOrNone(
          prev.halfYearDiscount,
          updated.halfYearDiscount
        ),
        fullYearDiscount: selectUpdatedOrNone(
          prev.fullYearDiscount,
          updated.fullYearDiscount
        ),
        forInvitesOnly: selectUpdatedOrNone(
          prev.forInvitesOnly,
          updated.forInvitesOnly
        ),
        active: selectUpdatedOrNone(prev.active, updated.active),
      });

      return as.casted(empty);
    }

    if (resource === Resource.Coupons && meta && meta.coupon) {
      const prev = as.casted<ICoupon.MappedAttributes>(meta.coupon);
      const updated = as.casted<{
        code: string;
        fullMonthDiscount: number;
        fullQuarterDiscount: number;
        halfYearDiscount: number;
        fullYearDiscount: number;
        planId: number;
      }>(variables);

      await atlas.coupon.update(resourceId, {
        code: selectUpdatedOrNone(prev.code, updated.code),
        fullMonthDiscount: selectUpdatedOrNone(
          prev.fullMonthDiscount,
          updated.fullMonthDiscount
        ),
        fullQuarterDiscount: selectUpdatedOrNone(
          prev.fullQuarterDiscount,
          updated.fullQuarterDiscount
        ),
        halfYearDiscount: selectUpdatedOrNone(
          prev.halfYearDiscount,
          updated.halfYearDiscount
        ),
        fullYearDiscount: selectUpdatedOrNone(
          prev.fullYearDiscount,
          updated.fullYearDiscount
        ),
        planId: selectUpdatedOrNone(prev.planId, updated.planId),
      });

      return as.casted(empty);
    }

    if (resource === Resource.Invites && meta && meta.invite) {
      const prev = as.casted<IInvite.MappedAttributes>(meta.invite);
      const updated = as.casted<{
        email: string;
        expiresAt: Dayjs;
        planId: number;
      }>(variables);

      const expiresAt = dayjs
        .utc(updated.expiresAt.format("YYYY-MM-DD"))
        .toISOString();

      await atlas.invite.update(resourceId, {
        email: selectUpdatedOrNone(prev.email, updated.email),
        expiresAt: selectUpdatedOrNone(prev.expiresAt, expiresAt),
        planId: selectUpdatedOrNone(prev.planId, updated.planId),
      });

      return as.casted(empty);
    }

    if (resource === Resource.Reports && meta && meta.report) {
      const prev = as.casted<IReport.MappedAttributes>(meta.report);
      const updated = as.casted<{
        title: string;
        description: string;
        category: string;
        resolved: boolean;
      }>(variables);

      await atlas.report.update(resourceId, {
        title: selectUpdatedOrNone(prev.title, updated.title),
        description: selectUpdatedOrNone(prev.description, updated.description),
        category: selectUpdatedOrNone(prev.category, updated.category),
        resolved: selectUpdatedOrNone(prev.resolved, updated.resolved),
      });

      return as.casted(empty);
    }

    if (resource === Resource.ReportReplies && meta && meta.reply) {
      const prev = as.casted<IReportReply.MappedAttributes>(meta.reply);
      const updated = as.casted<{
        draft?: boolean;
        message?: string;
      }>(variables);

      await atlas.reportReply.update(resourceId, {
        draft: selectUpdatedOrNone(prev.draft, updated.draft),
        message: selectUpdatedOrNone(prev.message, updated.message),
      });
      return as.casted(empty);
    }

    if (
      resource === Resource.MyInterviews &&
      meta &&
      meta.interview &&
      meta.currentUserId
    ) {
      const currentUserId = meta.currentUserId as number;
      const prev = meta.interview as IInterview.Self;
      const updated = zod
        .object({
          feedback: zod.object({
            interviewer: zod.union([zod.null(), zod.string()]),
          }),
          interviewerNote: zod.union([zod.null(), zod.string()]),
          passed: zod.union([zod.null(), zod.boolean()]),
          score: zod.union([zod.null(), zod.coerce.number()]),
          approved: zod.optional(zod.union([zod.null(), zod.boolean()])),
        })
        .parse(variables);

      await atlas.interview.update(resourceId, {
        feedback: {
          interviewer:
            selectUpdatedOrNone(
              prev.feedback.interviewer,
              updated.feedback.interviewer
            ) || undefined,
        },
        score: selectUpdatedOrNone(prev.score, updated.score) || undefined,
        interviewerNote:
          selectUpdatedOrNone(prev.interviewerNote, updated.interviewerNote) ||
          undefined,
        passed: selectUpdatedOrNone(prev.passed, updated.passed) || undefined,
        approved:
          selectUpdatedOrNone(prev.approved, updated.approved) || undefined,
        approvedBy:
          updated.approved !== undefined && updated.approved !== null
            ? currentUserId
            : undefined,
      });

      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  create: async ({ resource, variables }) => {
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

    if (resource === Resource.Plans) {
      const payload = as.casted<
        Omit<IPlan.CreateApiPayload, "weeklyMinutes"> & {
          hours: number;
          minutes: number;
        }
      >(variables);
      const response = await atlas.plan.create(
        merge(omit(payload, "minutes", "hours"), {
          weeklyMinutes: payload.hours * 60 + payload.minutes,
        })
      );
      return { data: as.casted(response) };
    }

    if (resource === Resource.Coupons) {
      const payload = as.casted<
        Omit<ICoupon.CreateApiPayload, "expiresAt"> & { expiresAt: Dayjs }
      >(variables);

      const response = await atlas.coupon.create(
        merge(omit(payload, "expiresAt"), {
          expiresAt: dayjs
            .utc(payload.expiresAt.format("YYYY-MM-DD"))
            .toISOString(),
        })
      );

      return { data: as.casted(response) };
    }

    if (resource === Resource.Invites) {
      const payload = as.casted<
        Omit<IInvite.CreateApiPayload, "expiresAt"> & { expiresAt: Dayjs }
      >(variables);

      const response = await atlas.invite.create(
        merge(omit(payload, "expiresAt"), {
          expiresAt: dayjs
            .utc(payload.expiresAt.format("YYYY-MM-DD"))
            .toISOString(),
        })
      );

      return { data: as.casted(response) };
    }

    if (resource === Resource.Reports) {
      const payload = as.casted<IReport.CreateApiPayload>(variables);
      const response = await atlas.report.create(payload);
      return { data: as.casted(response) };
    }

    if (resource === Resource.ReportReplies) {
      const payload = as.casted<IReportReply.CreateApiPayload>(variables);
      const response = await atlas.reportReply.create(payload);
      return { data: as.casted(response) };
    }

    throw new Error("Not implemented");
  },
  deleteOne: async ({ resource, id }) => {
    if (resource === Resource.MySchedule) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.slot.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Tutors) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.tutor.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Plans) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.plan.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Coupons) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.coupon.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Invites) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.invite.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Reports) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.report.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.ReportReplies) {
      const resourceId = zod.coerce.number().parse(id);
      await atlas.reportReply.delete(resourceId);
      return as.casted(empty);
    }

    if (resource === Resource.Assets) {
      const name = zod.string().parse(id);
      await atlas.asset.delete(name);
      return as.casted(empty);
    }

    throw new Error("Not implemented");
  },
  getList: async ({ resource, meta }: GetListParams) => {
    if (resource === Resource.MySchedule) {
      const slots = await atlas.slot.findMySlots();
      const calls = await atlas.call.findMyCalls();

      return {
        data: as.casted([{ slots, calls }]),
        total: 0,
      };
    }

    if (resource === Resource.Users) {
      const list = await atlas.user.find();
      return getListData(list.list, list.total);
    }

    if (resource === Resource.Tutors) {
      const list = await atlas.tutor.findAll();
      return { data: as.any(list).list, total: as.any(list).total };
    }

    if (resource === Resource.TutorsMedia) {
      const list = await atlas.tutor.findTutorsMedia();
      return getListData(list.list, list.total);
    }

    if (resource === Resource.MyInterviews) {
      const id = meta?.id;
      if (!id) return { data: as.casted([]), total: 0 };

      const hostId = as.int(id);
      const list = await atlas.interview.findInterviews(hostId);
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.Plans) {
      const list = await atlas.plan.findAll();
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.Coupons) {
      const list = await atlas.coupon.findAll();
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.Invites) {
      const list = await atlas.invite.findAll();
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.Reports) {
      const list = await atlas.report.findAll();
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.ReportReplies && meta && meta.reportId) {
      const { reportId } = zod
        .object({ reportId: zod.coerce.number() })
        .parse(meta);
      const list = await atlas.reportReply.findByReportId(reportId);
      return { data: as.casted(list), total: list.length };
    }

    if (resource === Resource.Assets) {
      const list = await atlas.asset.find();
      return {
        data: list.map((name, index) => ({ name, index: index + 1 })),
        total: list.length,
      };
    }

    throw new Error("Not implemented");
  },
  getApiUrl: () => backendUrl,
};
