import { User } from "@/user";
import { Auth } from "@/auth";
import { AvailabilitySlot } from "@/availabilitySlot";
import { Backend } from "@litespace/types";
import { Plan } from "@/plan";
import { Coupon } from "@/coupon";
import { Invite } from "@/invite";
import { Report } from "@/report";
import { ReportReply } from "@/reportReply";
import { Asset } from "@/asset";
import { Rating } from "@/rating";
import { Chat } from "@/chat";
import { Interview } from "@/interview";
import { Rule } from "@/rule";
import { Lesson } from "@/lesson";
import { WithdrawMethod } from "@/withdrawMethod";
import { Invoice } from "@/invoice";
import { Topic } from "@/topic";
import { AuthToken } from "@/client";
import { Cache } from "@/cache";
import { Session } from "@/session";

export class Atlas {
  public readonly user: User;
  public readonly auth: Auth;
  public readonly availabilitySlot: AvailabilitySlot;
  public readonly plan: Plan;
  public readonly coupon: Coupon;
  public readonly invite: Invite;
  public readonly report: Report;
  public readonly reportReply: ReportReply;
  public readonly asset: Asset;
  public readonly rating: Rating;
  public readonly chat: Chat;
  public readonly interview: Interview;
  public readonly rule: Rule;
  public readonly lesson: Lesson;
  public readonly withdrawMethod: WithdrawMethod;
  public readonly invoice: Invoice;
  public readonly cache: Cache;
  public readonly topic: Topic;
  public readonly session: Session;

  constructor(backend: Backend, token: AuthToken | null) {
    this.user = new User(backend, token);
    this.auth = new Auth(backend, token);
    this.availabilitySlot = new AvailabilitySlot(backend, token);
    this.plan = new Plan(backend, token);
    this.coupon = new Coupon(backend, token);
    this.invite = new Invite(backend, token);
    this.report = new Report(backend, token);
    this.reportReply = new ReportReply(backend, token);
    this.asset = new Asset(backend, token);
    this.rating = new Rating(backend, token);
    this.chat = new Chat(backend, token);
    this.interview = new Interview(backend, token);
    this.rule = new Rule(backend, token);
    this.lesson = new Lesson(backend, token);
    this.withdrawMethod = new WithdrawMethod(backend, token);
    this.invoice = new Invoice(backend, token);
    this.cache = new Cache(backend, token);
    this.topic = new Topic(backend, token);
    this.session = new Session(backend, token);
  }
}
