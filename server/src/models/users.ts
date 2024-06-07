import { knex, query } from "@/models/query";
import { first } from "lodash";
import { IUser } from "@litespace/types";

export class Users {
  async create(user: {
    email: string;
    password: string;
    name: string;
    type: IUser.Type;
  }): Promise<IUser.Self> {
    const rows = await knex<IUser.Row>("users").insert(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        type: user.type,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("User not found; should never happen");
    return this.from(row);
  }

  async createWithEmailOnly(email: string): Promise<IUser.Self> {
    const { rows } = await query<IUser.Row, [email: string]>(
      `
      INSERT INTO
          "users" ("email")
      values ($1) RETURNING "id",
          "email",
          "password"
          "name",
          "avatar",
          "type",
          "birthday",
          "gender",
          "online",
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
    id: number,
    user: Partial<{
      email: string;
      password: string;
      name: string;
      avatar: string;
      birthday: string;
      gender: IUser.Gender;
      online: boolean;
      type: IUser.Type;
    }>
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
            birthday = COALESCE($6, birthday),
            gender = COALESCE($7, gender),
            online = COALESCE($8, online),
            updated_at = NOW()
        where
            id = $9;
      `,
      [
        user.email,
        user.password,
        user.name,
        user.avatar,
        user.type,
        user.birthday,
        user.gender,
        user.online,
        id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await query("DELETE FROM users WHERE id = $1", [id]);
  }

  async findById(id: number): Promise<IUser.Self | null> {
    const { rows } = await query<IUser.Row, [number]>(
      `
        SELECT 
          "id",
          "email",
          "password",
          "name",
          "avatar",
          "type",
          "birthday",
          "gender",
          "online",
          "created_at",
          "updated_at"
        FROM users
        WHERE id = $1;
      `,
      [id]
    );

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findByEmail(email: string): Promise<IUser.Self | null> {
    const { rows } = await query<IUser.Row, [email: string]>(
      `
        SELECT 
          "id",
          "email",
          "password",
          "name",
          "avatar",
          "type",
          "birthday",
          "gender",
          "online",
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

  async findMany(ids: number[]): Promise<IUser.Self[]> {
    const { rows } = await query<IUser.Row, [number[]]>(
      `
        SELECT id, email, password, password, name, avatar, type, online, created_at, updated_at
        FROM users
        WHERE id in $1;
      `,
      [ids]
    );

    return rows.map((row) => this.from(row));
  }

  async findAll(): Promise<IUser.Self[]> {
    const { rows } = await query<IUser.Row, []>(
      `
      SELECT
          "id",
          "email",
          "password",
          "name",
          "avatar",
          "type",
          "online",
          "created_at",
          "updated_at"
      FROM users;
      `
    );

    return rows.map((row) => this.from(row));
  }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<IUser.Self | null> {
    const { rows } = await query<IUser.Row, [string, string]>(
      `
        SELECT id, email, password, name, avatar, type, online, created_at, updated_at
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

  async getTutors(): Promise<IUser.Self[]> {
    const { rows } = await query<IUser.Row, [typeof IUser.Type.Tutor]>(
      `
        SELECT id, email, name, avatar, type, online, created_at, updated_at
        FROM users
        WHERE type = $1;
      `,
      [IUser.Type.Tutor]
    );

    return rows.map((row) => this.from(row));
  }

  from(row: IUser.Row): IUser.Self {
    return {
      id: row.id,
      email: row.email,
      hasPassword: row.password !== null,
      name: row.name,
      avatar: row.avatar,
      birthday: row.birthday,
      gender: row.gender,
      type: row.type,
      online: row.online,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const users = new Users();
