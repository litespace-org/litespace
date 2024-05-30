import { query } from "@/models/query";
import { first } from "lodash";

export class Users {
  async create(user: {
    email: string;
    password: string;
    name: string;
    type: User.Type;
  }): Promise<User.Self> {
    const { rows } = await query<
      User.Row,
      [email: string, password: string, name: string, type: User.Type]
    >(
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
        values ($1, $2, $3, $4, NOW(), NOW())
        RETURNING
            id, email, name, avatar, type, active, created_at, updated_at;
      `,
      [user.email, user.password, user.name, user.type]
    );

    const row = first(rows);
    if (!row) throw new Error("Missing row id");
    return this.from(row);
  }

  async createWithEmailOnly(email: string): Promise<User.Self> {
    const { rows } = await query<User.Row, [email: string]>(
      `
      INSERT INTO
          "users" ("email")
      values ($1) RETURNING "id",
          "email",
          "name",
          "avatar",
          "type",
          "birthday",
          "gender",
          "active",
          "created_at",
          "updated_at";
      `,
      [email]
    );

    const row = first(rows);
    if (!row) throw new Error("User not found; should never happen");
    return this.from(row);
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
            active = COALESCE($6, active),
            updated_at = NOW()
        where
            id = $7;
      `,
      [
        user.email,
        user.password,
        user.name,
        user.avatar,
        user.type,
        user.active,
        user.id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await query("DELETE FROM users WHERE id = $1", [id]);
  }

  async findById(id: number): Promise<User.Self | null> {
    const { rows } = await query<User.Row, [number]>(
      `
        SELECT id, email, name, avatar, type, active, created_at, updated_at
        FROM users
        WHERE id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByEmail(email: string): Promise<User.Self | null> {
    const { rows } = await query<User.Row, [email: string]>(
      `
        SELECT 
          "id",
          "email",
          "name",
          "avatar",
          "type",
          "birthday",
          "gender",
          "active",
          "created_at",
          "updated_at"
        FROM users
        WHERE email = $1;
      `,
      [email]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findMany(ids: number[]): Promise<User.Self[]> {
    const { rows } = await query<User.Row, [number[]]>(
      `
        SELECT id, email, password, name, avatar, type, active, created_at, updated_at
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
        SELECT id, email, name, avatar, type, active, created_at, updated_at
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
        SELECT id, email, name, avatar, type, active, created_at, updated_at
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
        SELECT id, email, name, avatar, type, active, created_at, updated_at
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
      birthday: row.birthday,
      gender: row.gender,
      type: row.type,
      active: row.active,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const users = new Users();

export namespace User {
  export enum Type {
    SuperAdmin = "super_admin",
    RegularAdmin = "reg_admin",
    Tutor = "tutor",
    Student = "student",
  }

  export enum Gender {
    Male = "male",
    Female = "female",
  }

  export type Self = {
    id: number;
    email: string;
    name: string | null;
    avatar: string | null;
    birthday: string | null;
    gender: Gender | null;
    type: Type;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type Row = Omit<Self, "createdAt" | "updatedAt"> & {
    created_at: Date;
    updated_at: Date;
  };

  export type Credentials = {
    email: string;
    password: string;
  };
}
