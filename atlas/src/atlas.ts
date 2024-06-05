import { User } from "@/user";
import { Tutor } from "@/tutor";
import { Student } from "@/student";
import { Auth } from "@/auth";
import { Slot } from "@/slot";
import { Backend } from "@litespace/types";

export class Atlas {
  public readonly user: User;
  public readonly tutor: Tutor;
  public readonly student: Student;
  public readonly auth: Auth;
  public readonly slot: Slot;

  constructor(backend: Backend) {
    this.user = new User(backend);
    this.tutor = new Tutor(backend);
    this.student = new Student(backend);
    this.auth = new Auth(backend);
    this.slot = new Slot(backend);
  }
}
