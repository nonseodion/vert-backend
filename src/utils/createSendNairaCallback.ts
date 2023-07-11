import { Socket } from "socket.io";
import sendNaira from "../services/bank/sendNaira"
import { Rates } from "../services/bank/getRates";

type createSendNairaCallbackParams = {
  bankCode: string,
  accountNumber: number,
  accountName: string,
  rates: Rates,
  busdAmount: bigint,

  socket: Socket
}

// simply takes inputs and passes them to sendNaira
function createSendNairaCallback( params: createSendNairaCallbackParams ) {
  const {bankCode, accountName, accountNumber, rates, socket, busdAmount} = params

  return () => {
    sendNaira({
      bankAccount: {
        name: accountName,
        bankCode,
        number: accountNumber
      },
      busdAmount,
      rates,
      socket
    });
  }  
}

export default createSendNairaCallback;
