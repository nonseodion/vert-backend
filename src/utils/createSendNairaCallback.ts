import { Socket } from "socket.io";
import sendNaira from "../services/bank/sendNaira"
import { Rates } from "../services/bank/getRates";
import { SupportedClient } from "../services/blockchain/config.blockchain";
import { Hash } from "viem";

type createSendNairaCallbackParams = {
  bankCode: string,
  txHash: Hash,
  accountNumber: string,
  accountName: string,
  rates: Rates,
  busdAmount: bigint,
  swapTime: number,
  network: SupportedClient,
  socket: Socket
}

// simply takes inputs and passes them to sendNaira
function createSendNairaCallback( params: createSendNairaCallbackParams ) {
  const {bankCode, accountName, accountNumber, network, swapTime, rates, socket, busdAmount, txHash} = params

  return () => {
    sendNaira({
      bankAccount: {
        name: accountName,
        bankCode,
        number: accountNumber
      },
      txHash,
      busdAmount,
      rates,
      socket,
      network,
      swapTime
    });
  }  
}

export default createSendNairaCallback;
