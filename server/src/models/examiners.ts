import { withTransaction } from "@/models/query";
import { users } from "@/models/users";
import { first } from "lodash";
import { IExaminer, IUser } from "@litespace/types";

export class Examiners {
  async create(
    user: IUser.Credentials & { name: string }
  ): Promise<IExaminer.FullExaminer> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<IUser.Row>(
        `
        INSERT INTO
            "users" (
                "email",
                "password",
                "name",
                "type",
                "created_at",
                "updated_at"
            )
        values ( $1, $2, $3, 'examiner', NOW(), NOW())
        RETURNING
            id, email, name, avatar, type, active, created_at, updated_at;
        `,
        [user.email, user.password, user.name]
      );

      const row = first(rows);
      if (!row) throw new Error("User not found; should never happen");
      const mapped = users.from(row);

      await client.query(
        `
        INSERT INTO
            "examiners" ("id", "created_at", "updated_at")
        VALUES ($1, NOW(), NOW());
        `,
        [mapped.id]
      );

      return {
        ...mapped,
        zoomRefreshToken: null,
        aquiredRefreshTokenAt: null,
        authorizedZoomApp: false,
      };
    });
  }
}

export const examiners = new Examiners();
