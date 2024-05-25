import { query } from "@/database/query";
import { first } from "lodash";

export class Users {
  async create(
    user: Omit<User.Self, "id" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ): Promise<number> {
    const { rows } = await query<
      { id: number },
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
            id;
      `,
      [user.email, user.password, user.name, user.avatar, user.type]
    );

    const id = first(rows)?.id;
    if (!id) throw new Error("Missing row id");
    return id;
  }

  async update(
    user: Partial<User.Self> & { id: number; password?: string }
  ): Promise<void> {
    await query(
      `
        UPDATE users
        SET
            email = COALESCE($1, email),
            password = COALESCE($2, password),
            name = COALESCE($3, name),
            avatar = COALESCE($4, avatar),
            type = COALESCE($5, type),
            updated_at = NOW()
        where
            id = $6;
      `,
      [user.email, user.password, user.name, user.avatar, user.type, user.id]
    );
  }

  async delete(id: number): Promise<void> {
    await query("DELETE FROM users WHERE id = $1", [id]);
  }

  async findOne(id: number): Promise<User.Self | null> {
    const { rows } = await query<User.Row, [number]>(
      `
        SELECT id, email, name, avatar, type, created_at, updated_at
        FROM users
        WHERE id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findMany(ids: number[]): Promise<User.Self[]> {
    const { rows } = await query<User.Row, [number[]]>(
      `
        SELECT id, email, password, name, avatar, type, created_at, updated_at
        FROM users
        WHERE id in $1;
      `,
      [ids]
    );

    return rows.map((row) => this.from(row));
  }

  async findAll(): Promise<User.Self[]> {
    const { rows } = await query<User.Row, []>(
      `
        SELECT id, email, name, avatar, type, created_at, updated_at
        FROM users;
      `
    );

    return rows.map((row) => this.from(row));
  }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<User.Self | null> {
    const { rows } = await query<User.Row, [string, string]>(
      `
        SELECT id, email, name, avatar, type, created_at, updated_at
        FROM users
        WHERE
            email = $1
            AND password = $2;
      `,
      [email, password]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async getTutors(): Promise<User.Self[]> {
    const { rows } = await query<User.Row, [User.Type.Tutor]>(
      `
        SELECT id, email, name, avatar, type
        FROM users
        WHERE type = $1;
      `,
      [User.Type.Tutor]
    );

    return rows.map((row) => this.from(row));
  }

  from(row: User.Row): User.Self {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      type: row.type,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export namespace User {
  export enum Type {
    SuperAdmin = "super_admin",
    RegularAdmin = "reg_admin",
    Tutor = "tutor",
    Student = "student",
  }

  export type Self = {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
    type: Type;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = Omit<Self, "createdAt" | "updatedAt"> & {
    created_at: Date;
    updated_at: Date;
  };
}
