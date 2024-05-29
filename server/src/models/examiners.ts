import { query, withTransaction } from "@/models/query";
import { User, users } from "@/models/users";
import { first } from "lodash";

export class Examiners {
  async create(
    user: User.Credentials & { name: string }
  ): Promise<Examiner.FullExaminer> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<User.Row>(
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

export namespace Examiner {
  export type FullExaminer = User.Self & {
    zoomRefreshToken: string | null;
    aquiredRefreshTokenAt: string | null;
    authorizedZoomApp: boolean;
  };

  export type Self = {
    id: number;
    zoomRefreshToken: string | null;
    aquiredRefreshTokenAt: string | null;
    authorizedZoomApp: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = {
    id: number;
    zoom_refresh_token: string | null;
    aquired_refresh_token_at: Date | null;
    authorized_zoom_app: boolean;
    created_at: Date;
    updated_at: Date;
  };
}
