import express from "express";
import cors from "cors";

import { healthCheckRouter } from "./routes/healthCheck.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

//! command middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // allowing request of json type data with limit 16kb (you can update this value)
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // handling the url route request coming from the client
app.use(express.static("public")); // any images, css file, etc

//! routes

app.use("/api/v1", healthCheckRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
