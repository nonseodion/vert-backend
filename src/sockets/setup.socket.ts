import {Server as HttpServer} from "http";
import { Server } from "socket.io";
import txNameSpace from "./transaction.socket";
import rateNameSpace from "./rate.socket";

function setupSocket(httpServer: HttpServer){
  const io = new Server(httpServer);
  
  // setup name spaces
  txNameSpace(io);
  rateNameSpace(io);
}

export default setupSocket;