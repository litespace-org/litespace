import { query } from "@/database/query";
import { User } from "@/database/users";
import { Tutor } from "@/database/tutors";

export class Complex {
  async getTutors(): Promise<Complex.Tutor[]> {
    const { rows } = await query<Complex.Tutor, []>(`
        SELECT *
        FROM users
            JOIN tutors on users.id = tutors.id
        WHERE
            users.id = tutors.id;
      `);

    return rows;
  }
}

export namespace Complex {
  export type Tutor = User.Self & Tutor.Self;
}
