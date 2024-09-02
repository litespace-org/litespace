import session from "express-session";
import connect from "connect-pg-simple";
import { pool } from "@litespace/models";

export function initSession({ secure }: { secure: boolean }) {
  const Store = connect(session);
  const middleware = session({
    secret: "keyboard cat", // todo: define constants
    resave: false,
    saveUninitialized: false,
    store: new Store({ pool, tableName: "sessions" }),
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure }, // 30 days
  });

  return middleware;
}
