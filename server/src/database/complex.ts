import { query } from "@/database/query";
import { User } from "@/database/users";
import { Tutor } from "@/database/tutors";
import { first } from "lodash";

export class Complex {
  // todo: handle dates and types
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

  async getTutorById(id: number): Promise<Complex.Tutor | null> {
    const { rows } = await query<Complex.Tutor, [id: number]>(
      `
        SELECT *
        FROM users
            JOIN tutors on users.id = tutors.id
        WHERE
            users.id = $1;
      `,
      [id]
    );

    const tutor = first(rows);
    if (!tutor) return null;
    return tutor;
  }
}

export namespace Complex {
  export type Tutor = User.Self & Tutor.Self;
}
