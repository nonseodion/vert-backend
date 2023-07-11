import { Server } from "socket.io";
import getRates from "../services/bank/getRates";
import { RateEvents } from "./events";


function _rateSocket(io: Server){
  const rateSocket = io.of("/rates")

  let rateIntervalSet = false;
  let latestRatesData;

  rateSocket.on("connection", async (socket) => {
    socket.join("rates");
    
    if(rateIntervalSet) {
      socket.emit(RateEvents.RATES, latestRatesData || await getRates())
      return;
    }else{
      rateIntervalSet = true;
      latestRatesData = await getRates();
      socket.emit("rates", latestRatesData)
    }

    setInterval(async () => {
      latestRatesData = await getRates();
      rateSocket.to("rates").emit("rates", latestRatesData)
    }, 60000);

    
  });
}

export default _rateSocket;