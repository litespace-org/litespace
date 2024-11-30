import { User } from "@/derived/user";
import { Auth } from "@/derived/auth";
import { Backend } from "@litespace/types";
import { Call } from "@/derived/call";
import { Plan } from "@/derived/plan";
import { Coupon } from "@/derived/coupon";
import { Invite } from "@/derived/invite";
import { Report } from "@/derived/report";
import { ReportReply } from "@/derived/reportReply";
import { Asset } from "@/derived/asset";
import { Rating } from "@/derived/rating";
import { Chat } from "@/derived/chat";
import { Interview } from "@/derived/interview";
import { Rule } from "@/derived/rule";
import { Lesson } from "@/derived/lesson";
import { WithdrawMethod } from "@/derived/withdrawMethod";
import { Invoice } from "@/derived/invoice";
import { Topic } from "@/derived/topic";
import { Cache } from "@/derived/cache";
import { Peer } from "@/derived/peer";

import { GetToken } from "@/types";

export class Atlas {
  public readonly user: User;
  public readonly auth: Auth;
  public readonly call: Call;
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
  public readonly peer: Peer;

  constructor(backend: Backend, getToken: GetToken) {
    this.user = new User(backend, getToken);
    this.auth = new Auth(backend, getToken);
    this.call = new Call(backend, getToken);
    this.plan = new Plan(backend, getToken);
    this.coupon = new Coupon(backend, getToken);
    this.invite = new Invite(backend, getToken);
    this.report = new Report(backend, getToken);
    this.reportReply = new ReportReply(backend, getToken);
    this.asset = new Asset(backend, getToken);
    this.rating = new Rating(backend, getToken);
    this.chat = new Chat(backend, getToken);
    this.interview = new Interview(backend, getToken);
    this.rule = new Rule(backend, getToken);
    this.lesson = new Lesson(backend, getToken);
    this.withdrawMethod = new WithdrawMethod(backend, getToken);
    this.invoice = new Invoice(backend, getToken);
    this.cache = new Cache(backend, getToken);
    this.topic = new Topic(backend, getToken);
    this.peer = new Peer(backend, getToken);
  }
}
