import { Server } from "socket.io";
import crypto from "node:crypto";

function _rateNameSpace(io: Server){
  const rateNameSpace = io.of("/rates")

  rateNameSpace.on("connection", (socket) => {
    socket.join("rates");
    setInterval(() => {
      // get rates
      const rates = {
        USD_BUSD: "",
        USD_NGN: ""
      }
      
      // sign rates with a timestamp to ensure the client sends back correct rates
      // within a specific time
      const data = {
        rates, time: new Date().getTime()
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const signature = crypto.sign("SHA256", JSON.stringify(data), process.env.PRIVATE_KEY)
        .toString("hex");
      socket.to("rates").emit("rates", {data, signature})
    }, 300);
  });
}

export default _rateNameSpace;