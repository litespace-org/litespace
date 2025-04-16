import { User } from "@/api/user";
import { Auth } from "@/api/auth";
import { AvailabilitySlot } from "@/api/availabilitySlot";
import { Env } from "@litespace/types";
import { Plan } from "@/api/plan";
import { Coupon } from "@/api/coupon";
import { Invite } from "@/api/invite";
import { Report } from "@/api/report";
import { ReportReply } from "@/api/reportReply";
import { Asset } from "@/api/asset";
import { Rating } from "@/api/rating";
import { Chat } from "@/api/chat";
import { Interview } from "@/api/interview";
import { Lesson } from "@/api/lesson";
import { WithdrawMethod } from "@/withdrawMethod";
import { Invoice } from "@/api/invoice";
import { Topic } from "@/api/topic";
import { AuthToken, createClient } from "@/lib/client";
import { Cache } from "@/api/cache";
import { Session } from "@/api/session";
import { ContactRequest } from "@/api/contactRequest";
import { Fawry } from "@/api/fawry";

export class Api {
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
  public readonly fawry: Fawry;

  constructor(server: Env.Server, token: AuthToken | null) {
    const client = createClient("api", server, token);
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
    this.fawry = new Fawry(client);
  }
}
