import { column, countRows, knex, withPagination } from "@/query";
import { first, isEmpty } from "lodash";
import { IUser, Paginated } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";

export class Users {
  public readonly table = "users" as const;
  public readonly columns: {
    filterable: [keyof IUser.Row, ...Array<keyof IUser.Row>];
  } = {
    filterable: [
      "id",
      "email",
      "name",
      "role",
      "birth_year",
      "gender",
      "verified",
      "city",
      "credit_score",
      "created_at",
      "updated_at",
    ],
  } as const;

  async create(
    user: IUser.CreatePayload,
    tx?: Knex.Transaction
  ): Promise<IUser.Self> {
    const now = new Date();
    const rows = await this.builder(tx).insert(
      {
        email: user.email,
        password: user.password,
        name: user.name,
        birth_year: user.birthYear,
        gender: user.gender,
        role: user.role,
        verified: user.verified,
        created_at: now,
        updated_at: now,
      },
      "*"
    );

    const row = first(rows);
    if (!row) throw new Error("User not found; should never happen");
    return this.from(row);
  }

  async update(
    id: number,
    payload: IUser.UpdatePayload,
    tx?: Knex.Transaction
  ): Promise<IUser.Self> {
    const now = dayjs.utc().toDate();
    const rows = await this.builder(tx)
      .update({
        email: payload.email,
        image: payload.image,
        gender: payload.gender,
        name: payload.name,
        verified: payload.verified,
        password: payload.password,
        birth_year: payload.birthYear,
        phone_number: payload.phoneNumber,
        city: payload.city,
        credit_score: payload.creditScore,
        updated_at: now,
      })
      .where("id", id)
      .returning("*");

    const row = first(rows);
    if (!row) throw new Error("User not found; should never happen.");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IUser.Row>("users").where("id", id).del();
  }

  async findOneBy<T extends keyof IUser.Row>(
    key: T,
    value: IUser.Row[T]
  ): Promise<IUser.Self | null> {
    const rows = await this.findManyBy(key, value);
    return first(rows) || null;
  }

  async findById(id: number): Promise<IUser.Self | null> {
    return await this.findOneBy("id", id);
  }

  async findByEmail(email: string): Promise<IUser.Self | null> {
    return await this.findOneBy("email", email);
  }

  async findManyBy<T extends keyof IUser.Row>(
    key: T,
    value: IUser.Row[T]
  ): Promise<IUser.Self[]> {
    const rows = await knex<IUser.Row>(this.table)
      .select("*")
      .where(key, value);

    return rows.map((row) => this.from(row));
  }

  async exists(id: number): Promise<boolean> {
    const rows = await knex<IUser.Row>(this.table).select("id").where("id", id);
    return !isEmpty(rows);
  }

  async find({
    tx,
    role,
    verified,
    gender,
    page,
    size,
    orderBy,
    orderDirection,
    city,
  }: IUser.FindUsersApiQuery & {
    tx?: Knex.Transaction;
  }): Promise<Paginated<IUser.Self>> {
    const base = this.builder(tx)
      .select()
      .orderBy(this.column(orderBy || "created_at"), orderDirection || "desc");

    if (role) base.andWhere(this.column("role"), role);
    if (verified) base.andWhere(this.column("verified"), verified);
    if (gender) base.andWhere(this.column("gender"), gender);
    //if (online) base.andWhere(this.column("online"), online); TODO: to be removed
    if (city) base.andWhere(this.column("city"), city);

    const total = await countRows(base.clone().groupBy(this.column("id")));
    const rows = await withPagination(base.clone(), { page, size });
    const users = rows.map((row) => this.from(row));

    return { list: users, total };
  }

  async findUserPasswordHash(id: number): Promise<string | null> {
    const rows = await knex<IUser.Row>(this.table)
      .select(this.column("password"))
      .where(this.column("id"), id);

    const row = first(rows);
    if (!row) return null;
    return row.password;
  }

  async findByCredentials({
    email,
    password,
  }: IUser.Credentials): Promise<IUser.Self | null> {
    const rows = await knex<IUser.Row>(this.table)
      .select("*")
      .where("email", email)
      .andWhere("password", password);

    const row = first(rows);
    if (!row) return null;
    return this.from(row);
  }

  from(row: IUser.Row): IUser.Self {
    return {
      id: row.id,
      email: row.email,
      password: row.password !== null,
      name: row.name,
      image: row.image,
      birthYear: row.birth_year,
      gender: row.gender,
      role: row.role,
      verified: row.verified,
      creditScore: row.credit_score,
      phoneNumber: row.phone_number,
      city: row.city,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  builder(tx?: Knex.Transaction) {
    return tx ? tx<IUser.Row>(this.table) : knex<IUser.Row>(this.table);
  }

  column(value: keyof IUser.Row) {
    return column(value, this.table);
  }
}

export const users = new Users();
