import express from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";
const { Router } = express;

const healthCheckRouter = Router();

healthCheckRouter.route("/").get(healthCheck);

export { healthCheckRouter };
