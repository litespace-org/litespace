import { Base } from "@/base";
import { User } from "@/user";
import { Tutor } from "@/tutor";
import { Student } from "@/student";
import { Backend } from "@litespace/types";

export class Atlas {
  public readonly user: User;
  public readonly tutor: Tutor;
  public readonly student: Student;

  constructor(backend: Backend) {
    this.user = new User(backend);
    this.tutor = new Tutor(backend);
    this.student = new Student(backend);
  }
}
