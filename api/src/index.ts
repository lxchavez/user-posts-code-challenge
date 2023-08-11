import { config } from "dotenv";
import express, { Express } from "express";
import router from "./router";

// Load secrets from .env file contents into process.env.
config({ path: ".env" });

const app: Express = express();
const port = 3000;

app.use("/", router);

app.listen(port, () => console.log(`app listening on port ${port}!`));
