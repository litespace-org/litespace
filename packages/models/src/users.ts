import { column, countRows, knex, withSkippablePagination } from "@/query";
import { first, isEmpty } from "lodash";
import { IUser, Paginated } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";

export class Users {
  public readonly table = "users" as const;

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
        address: user.address,
        birth_year: user.birthYear,
        gender: user.gender,
        role: user.role,
        verified_email: user.verifiedEmail,
        verified_phone: user.verifiedPhone,
        notification_method: user.notificationMethod,
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
        email: payload.email?.toLowerCase(),
        image: payload.image,
        gender: payload.gender,
        name: payload.name,
        address: payload.address,
        verified_email: payload.verifiedEmail,
        verified_phone: payload.verifiedPhone,
        password: payload.password,
        birth_year: payload.birthYear,
        phone: payload.phone,
        city: payload.city,
        credit_score: payload.creditScore,
        notification_method: payload.notificationMethod,
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
    orderBy,
    orderDirection,
    city,
    ...pagination
  }: IUser.FindUsersQuery & {
    tx?: Knex.Transaction;
  }): Promise<Paginated<IUser.Self>> {
    const base = this.builder(tx);

    if (role) base.andWhere(this.column("role"), role);
    if (verified) base.andWhere(this.column("verified_email"), verified);
    if (gender) base.andWhere(this.column("gender"), gender);
    if (city) base.andWhere(this.column("city"), city);

    const total = await countRows(base.clone(), {
      column: this.column("id"),
      distinct: true,
    });

    const query = base
      .clone()
      .select()
      .orderBy(this.column(orderBy || "created_at"), orderDirection || "desc");
    const rows = await withSkippablePagination(query, pagination);
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
      address: row.address,
      birthYear: row.birth_year,
      gender: row.gender,
      role: row.role,
      verifiedEmail: row.verified_email,
      verifiedPhone: row.verified_phone,
      creditScore: row.credit_score,
      phone: row.phone,
      city: row.city,
      notificationMethod: row.notification_method,
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
