import { createServer } from "node:http";
import { Server } from "socket.io";
import express, { json } from "express";
import routes from "@/routes";
import { facebookConfig, googleConfig, serverConfig } from "@/constants";
import { errorHandler } from "@/middleware/error";
import { authorizedSocket } from "@/middleware/auth";
import { wssHandler } from "@/wss";
import { Strategy as Google } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import logger from "morgan";
import "colors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// todo: use dedicated auth middleware for socket.io
io.engine.use(authorizedSocket);
io.on("connection", wssHandler);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser<number>((id, done) => done(null, { id }));

passport.use(
  new Google(
    {
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refershToken, profile, callback) => {
      console.log({ accessToken, refershToken, profile, callback });
      callback(null, { id: 1 });
    }
  )
);

passport.use(
  new Facebook(
    {
      clientID: facebookConfig.appId,
      clientSecret: facebookConfig.appSecret,
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken, refershToken, profile, callback) => {
      console.log({ accessToken, refershToken, profile, callback });
      callback(null, { id: 1 });
    }
  )
);

// https://youtu.be/SBvmnHTQIPY?t=2517
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// google

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/dashboard/google");
  }
);

// facebook
app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/dashboard/facebook");
  }
);

app.use(logger("dev"));
app.use(cors());
app.use(json());
app.use("/api/v1/user", routes.user);
app.use("/api/v1/slot", routes.slot);
app.use("/api/v1/tutor", routes.tutor);
app.use("/api/v1/student", routes.student);
app.use("/api/v1/zoom", routes.zoom);
app.use("/api/v1/lesson", routes.lesson);
app.use("/api/v1/rating", routes.rating);
app.use("/api/v1/subscription", routes.subscription);
app.use("/api/v1/chat", routes.chat);
app.use(errorHandler);

server.listen(serverConfig.port, serverConfig.host, () =>
  console.log(`Server is running on port ${serverConfig.port}`.cyan)
);
