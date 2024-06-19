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

  constructor(backend: Backend) {
    this.user = new User(backend);
    this.tutor = new Tutor(backend);
    this.student = new Student(backend);
    this.auth = new Auth(backend);
    this.slot = new Slot(backend);
    this.call = new Call(backend);
    this.plan = new Plan(backend);
    this.coupon = new Coupon(backend);
    this.invite = new Invite(backend);
  }
}
