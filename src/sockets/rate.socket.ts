import { Server } from "socket.io";
import getRates from "../services/bank/getRates";
import { RateEvents } from "./events";


function _rateSocket(io: Server){
  const rateSocket = io.of("/rates")

  let rateIntervalSet = false;
  let latestRatesData;

  rateSocket.on("connection", async (socket) => {
    socket.join("rates");
    
    try{
      if(rateIntervalSet) {
        socket.emit(RateEvents.RATES, latestRatesData || await getRates())
        return;
      }else{
        rateIntervalSet = true;
        latestRatesData = await getRates();
        socket.emit(RateEvents.RATES, latestRatesData)
      }

      setInterval(async () => {
        try{
          latestRatesData = await getRates();
        }catch(err){console.log("rateSocket_Failure: Interval Fetch failed", err)}
        
        rateSocket.to("rates").emit(RateEvents.RATES, latestRatesData)
      }, 120000);
    } catch(err){
      console.log("rateSocket_Failure:", err.message);
    }
  });
}

export default _rateSocket;