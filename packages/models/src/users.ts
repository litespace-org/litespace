import {
  countRows,
  knex,
  WithOptionalTx,
  withSkippablePagination,
} from "@/query";
import { first, isEmpty } from "lodash";
import { IUser, Paginated } from "@litespace/types";
import { Knex } from "knex";
import dayjs from "@/lib/dayjs";
import { Model } from "@/lib/model";

const FIELD_TO_COLUMN = {
  id: "id",
  email: "email",
  password: "password",
  name: "name",
  image: "image",
  address: "address",
  birthYear: "birth_year",
  gender: "gender",
  role: "role",
  verifiedEmail: "verified_email",
  verifiedPhone: "verified_phone",
  verifiedWhatsApp: "verified_whatsapp",
  creditScore: "credit_score",
  city: "city",
  phone: "phone",
  notificationMethod: "notification_method",
  createdAt: "created_at",
  updatedAt: "updated_at",
} satisfies Record<IUser.Field, IUser.Column>;

export class Users extends Model<
  IUser.Row,
  IUser.Self,
  typeof FIELD_TO_COLUMN
> {
  constructor() {
    super({
      table: "users",
      fieldColumnMap: FIELD_TO_COLUMN,
      transform: {
        password: (value: string | null) => value !== null,
      },
    });
  }

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
    payload: IUser.UpdateModelPayload,
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
        verified_whatsapp: payload.verifiedWhatsApp,
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
    if (!row) throw new Error("user not found, should never happen");
    return this.from(row);
  }

  async delete(id: number): Promise<void> {
    await knex<IUser.Row>("users").where(this.column("id"), id).del();
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

  async find<T extends IUser.Field = IUser.Field>({
    tx,
    role,
    verified,
    gender,
    city,
    select,
    ...pagination
  }: WithOptionalTx<IUser.FindModelQuery<T>>): Promise<
    Paginated<Pick<IUser.Self, T>>
  > {
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
      .select(this.select(select))
      .orderBy([
        {
          column: this.column("created_at"),
          order: "desc",
        },
        {
          column: this.column("id"),
          order: "desc",
        },
      ]);

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
}

export const users = new Users();
