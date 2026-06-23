import expressSession from 'express-session';
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response, Router } from "express";
import { envVars } from "./app/config/env";
import passport from 'passport';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';




const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({ secret: "secret", resave: false, saveUninitialized: false }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", Router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Parcelsync Parcel Manamgement System!",
    })
})

app.use(globalErrorHandler);
app.use(notFound);

export default app;
