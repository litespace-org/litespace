import { query, withTransaction } from "@/models/query";
import { User, users } from "@/models/users";
import { first } from "lodash";

export class Examiners {
  async create(
    user: Omit<User.Self, "id" | "createdAt" | "updatedAt" | "active"> & {
      password: string;
    }
  ): Promise<Examiner.FullExaminer> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<
        User.Row,
        [
          email: string,
          password: string,
          name: string,
          avatar: string | null,
          type: User.Type
        ]
      >(
        `
        INSERT INTO
            users (
                email,
                password,
                name,
                avatar,
                type,
                created_at,
                updated_at
            )
        values ( $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING
            id, email, name, avatar, type, active, created_at, updated_at;
      `,
        [user.email, user.password, user.name, user.avatar, user.type]
      );

      const row = first(rows);
      if (!row) throw new Error("User not found; should never happen");
      const mapped = users.from(row);

      await client.query(
        `
        INSERT INTO
            "examiners" ("id", created_at, updated_at)
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
