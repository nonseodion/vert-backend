import { createServer } from "http"
import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import banksRouter from "./routes/banks/banks.routes";
import { config } from "dotenv";
import setupSocket from "./sockets/setup.socket";
import checkBlockchainTx from "./services/blockchain/getTxConfirmations";

config();

// express
const app = express();
app.use(morgan("tiny"));
app.use(helmet());

const PORT = 3000;

app.use("/banks", banksRouter);

app.get("/", (_, res) => {
  res.send("Welcome to Vert API");
})


//sockets
const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log("Listening on port: ", PORT)
})


// remove
// checkBlockchainTx(
//   "0x27d677df5fc2ee689c68d39ea319692afd60ab18adecd83d6a24076f4e9bb580", 
//   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
// ).then(console.log);