import { User } from "@/user";
import { Tutor } from "@/tutor";
import { Student } from "@/student";
import { Auth } from "@/auth";
import { Slot } from "@/slot";
import { Backend } from "@litespace/types";
import { Call } from "@/call";
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
import { GetToken } from "@/client";

export class Atlas {
  public readonly user: User;
  public readonly tutor: Tutor;
  public readonly student: Student;
  public readonly auth: Auth;
  public readonly slot: Slot;
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

  constructor(backend: Backend, getToken: GetToken) {
    this.user = new User(backend, getToken);
    this.tutor = new Tutor(backend, getToken);
    this.student = new Student(backend, getToken);
    this.auth = new Auth(backend, getToken);
    this.slot = new Slot(backend, getToken);
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
  }
}
