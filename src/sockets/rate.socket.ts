import { Server } from "socket.io";

function _rateNameSpace(io: Server){
  const rateNameSpace = io.of("/rates")
}

export default _rateNameSpace;