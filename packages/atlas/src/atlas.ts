import { User } from "@/user";
import { Auth } from "@/auth";
import { AvailabilitySlot } from "@/availabilitySlot";
import { Env } from "@litespace/types";
import { Plan } from "@/plan";
import { Coupon } from "@/coupon";
import { Invite } from "@/invite";
import { Report } from "@/report";
import { ReportReply } from "@/reportReply";
import { Asset } from "@/asset";
import { Rating } from "@/rating";
import { Chat } from "@/chat";
import { Interview } from "@/interview";
import { Lesson } from "@/lesson";
import { WithdrawMethod } from "@/withdrawMethod";
import { Invoice } from "@/invoice";
import { Topic } from "@/topic";
import { AuthToken } from "@/client";
import { Cache } from "@/cache";
import { Session } from "@/session";
import { ContactRequest } from "@/contactRequest";

export class Atlas {
  public readonly user: User;
  public readonly auth: Auth;
  public readonly availabilitySlot: AvailabilitySlot;
  public readonly contactRequest: ContactRequest;
  public readonly plan: Plan;
  public readonly coupon: Coupon;
  public readonly invite: Invite;
  public readonly report: Report;
  public readonly reportReply: ReportReply;
  public readonly asset: Asset;
  public readonly rating: Rating;
  public readonly chat: Chat;
  public readonly interview: Interview;
  public readonly lesson: Lesson;
  public readonly withdrawMethod: WithdrawMethod;
  public readonly invoice: Invoice;
  public readonly cache: Cache;
  public readonly topic: Topic;
  public readonly session: Session;

  constructor(server: Env.Server, token: AuthToken | null) {
    this.user = new User(server, token);
    this.auth = new Auth(server, token);
    this.availabilitySlot = new AvailabilitySlot(server, token);
    this.contactRequest = new ContactRequest(server, token);
    this.plan = new Plan(server, token);
    this.coupon = new Coupon(server, token);
    this.invite = new Invite(server, token);
    this.report = new Report(server, token);
    this.reportReply = new ReportReply(server, token);
    this.asset = new Asset(server, token);
    this.rating = new Rating(server, token);
    this.chat = new Chat(server, token);
    this.interview = new Interview(server, token);
    this.lesson = new Lesson(server, token);
    this.withdrawMethod = new WithdrawMethod(server, token);
    this.invoice = new Invoice(server, token);
    this.cache = new Cache(server, token);
    this.topic = new Topic(server, token);
    this.session = new Session(server, token);
  }
}
