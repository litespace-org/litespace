import { knex, query, withFilter } from "@/models/query";
import { first, isEmpty, merge } from "lodash";
import { IFilter, IUser } from "@litespace/types";
import { Knex } from "knex";

export class Users {
  table = "users";
  columns: { filterable: [keyof IUser.Row, ...Array<keyof IUser.Row>] } = {
    filterable: [
      "id",
      "email",
      "name",
      "role",
      "birth_year",
      "gender",
      "online",
      "verified",
      "credit_score",
      "created_at",
      "updated_at",
    ],
  };

  async create(user: {
    email: string;
    password: string;
    name: string;
    role: IUser.Role;
  }): Promise<IUser.Self> {
    const now = new Date();
    const rows = await knex<IUser.Row>("users").insert(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
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
          "role",
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
        role: payload.role,
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

  async exists(id: number): Promise<boolean> {
    const rows = await knex<IUser.Row>(this.table).select("id").where("id", id);
    return !isEmpty(rows);
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

  async find(filter?: IFilter.Self): Promise<IUser.Self[]> {
    const builder = withFilter({
      builder: knex<IUser.Row>(this.table),
      filter,
    });
    const result = await builder.then();

    return [...result] as any;
  }

  async findByCredentials(
    email: string,
    password: string
  ): Promise<IUser.Self | null> {
    const { rows } = await query<IUser.Row, [string, string]>(
      `
        SELECT id, email, password, name, photo, role, online, created_at, updated_at
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
    const { rows } = await query<IUser.Row, [typeof IUser.Role.Tutor]>(
      `
        SELECT id, email, name, photo, type, online, created_at, updated_at
        FROM users
        WHERE type = $1;
      `,
      [IUser.Role.Tutor]
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
      role: row.role,
      online: row.online,
      verified: row.verified,
      creditScore: row.credit_score,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IUser.Row>(this.table) : knex<IUser.Row>(this.table);
  }
}

export const users = new Users();
