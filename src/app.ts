import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import banksRouter from "./routes/banks/banks.routes";
import { config } from "dotenv";

config();

const app = express();
app.use(morgan("tiny"));
app.use(helmet());

const PORT = 3000;

app.use("/banks", banksRouter);

app.get("/", (_, res) => {
  res.send("Welcome to Vert API");
})

app.listen(PORT, () => {
  console.log("Listening on port: ", PORT)
})
