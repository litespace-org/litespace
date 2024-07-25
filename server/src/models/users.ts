import { knex, query } from "@/models/query";
import { first, merge } from "lodash";
import { IUser } from "@litespace/types";
import dayjs from "dayjs";
import { Knex } from "knex";

export class Users {
  name = "users";

  async create(user: {
    email: string;
    password: string;
    name: string;
    type: IUser.Type;
  }): Promise<IUser.Self> {
    const now = new Date();
    const rows = await knex<IUser.Row>("users").insert(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        type: user.type,
        created_at: now,
        updated_at: now,
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
          "photo",
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
    payload: IUser.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<void> {
    const now = new Date();
    await this.builder(tx)
      .update({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        photo: payload.photo,
        birth_year: payload.birthYear,
        gender: payload.gender,
        type: payload.type,
        verified: payload.verified,
        updated_at: now,
      })
      .where("id", id);
  }

  async delete(id: number): Promise<void> {
    await knex<IUser.Row>("users").where("id", id).del();
  }

  async findOneBy<T extends keyof IUser.Row>(
    key: T,
    value: IUser.Row[T]
  ): Promise<IUser.Self | null> {
    const rows = await knex<IUser.Row>("users").select("*").where(key, value);
    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  async findById(id: number): Promise<IUser.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findByEmail(email: string): Promise<IUser.Self | null> {
    return await this.findOneBy("email", email);
  }

  async findMany(ids: number[]): Promise<IUser.Self[]> {
    const { rows } = await query<IUser.Row, [number[]]>(
      `
        SELECT id, email, password, password, name, photo, type, online, created_at, updated_at
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
          "photo",
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
        SELECT id, email, password, name, photo, type, online, created_at, updated_at
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
        SELECT id, email, name, photo, type, online, created_at, updated_at
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
      photo: row.photo,
      birthYear: row.birth_year,
      gender: row.gender,
      type: row.type,
      online: row.online,
      verified: row.verified,
      creditScore: row.credit_score,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IUser.Row>(this.name) : knex<IUser.Row>(this.name);
  }
}

export const users = new Users();
