import { Server } from "socket.io";

function _txNameSpace(io: Server){
  const txNameSpace = io.of("/transactions")
}

export default _txNameSpace;