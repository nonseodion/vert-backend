import {Server as HttpServer} from "http";
import { Server } from "socket.io";
import txSocket from "./transaction.socket";
import rateSocket from "./rate.socket";

function setupSocket(httpServer: HttpServer){
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? "https://vert-exchange.vercel.app/" : "http://localhost:3000" 
    }
  });
  
  // setup name spaces
  txSocket(io);
  rateSocket(io);
}

export default setupSocket;