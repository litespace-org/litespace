import { User } from "@/user";
import { Auth } from "@/auth";
import { Analytics } from "@/analytics";
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
import { AuthToken, createClient } from "@/client";
import { Cache } from "@/cache";
import { Session } from "@/session";
import { ContactRequest } from "@/contactRequest";

export class Atlas {
  public readonly user: User;
  public readonly auth: Auth;
  public readonly analytics: Analytics;
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
    const client = createClient(server, token);
    this.user = new User(client);
    this.auth = new Auth(client);
    this.availabilitySlot = new AvailabilitySlot(client);
    this.contactRequest = new ContactRequest(client);
    this.plan = new Plan(client);
    this.coupon = new Coupon(client);
    this.invite = new Invite(client);
    this.report = new Report(client);
    this.reportReply = new ReportReply(client);
    this.asset = new Asset(client);
    this.rating = new Rating(client);
    this.chat = new Chat(client);
    this.interview = new Interview(client);
    this.lesson = new Lesson(client);
    this.withdrawMethod = new WithdrawMethod(client);
    this.invoice = new Invoice(client);
    this.cache = new Cache(client);
    this.topic = new Topic(client);
    this.session = new Session(client);
    this.analytics = new Analytics(client);
  }
}
