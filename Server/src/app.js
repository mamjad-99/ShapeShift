import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import exerciseVideosRouter from "./routes/exercise.videos.routes.js";
const app = express();

//cors => cross origin resource sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//for url data
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//limit json parsers about 16kb => for form
app.use(express.json({ limit: "16kb" }));

//to keep data in server
app.use(express.static("public"));

//to change cookies of user browser
app.use(cookieParser());

//Routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/exercises", exerciseVideosRouter);

export default app;
