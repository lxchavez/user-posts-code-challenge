import AppConfig from "config";
import { config } from "dotenv";
import express, { Express } from "express";
import router from "./router";

const API_PREFIX = AppConfig.get("ExpressServer.apiPrefix") as string;
const PORT = AppConfig.get("ExpressServer.port") as number;

// Load secrets from .env file contents into process.env.
config({ path: ".env" });

const app: Express = express();

app.use(API_PREFIX, router);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));
}

export default app;
