import { Server } from "socket.io";

import verifySwapTx from "../services/blockchain/verifySwapTx";
import { Address, Hash } from "viem";
import { SupportedClient, getClient } from "../services/blockchain/config.blockchain";
import monitorTx from "../services/blockchain/monitorTx";
import { TransactionEvents } from "./events";
import { Rates } from "../services/bank/getRates";
import createSendNairaCallback from "../utils/createSendNairaCallback";
import validateTxSocketArgs from "../utils/validateTxSocketArgs";

type TxEventsSwapParams = {
  txHash: Hash,
  sender: Address, 
  bankCode: string, 
  accountName: string, 
  accountNumber: string, 
  rates: Rates,
  network: SupportedClient
}


function _txSocket(io: Server){
  const txSocket = io.of("/transactions");

  txSocket.on("connection", (socket) => {
    // triggered when a swap is comlete on the frontend
    socket.on(TransactionEvents.SWAP, async (params: TxEventsSwapParams) => {
      const { txHash, sender, bankCode, accountName, accountNumber, rates, network }  = params;
      const {error, valid} = validateTxSocketArgs(txHash, sender, bankCode, accountName, accountNumber, network);

      if(!valid){
        socket.emit(TransactionEvents.ARG_VALIDITY, error);
        return;
      }

      let BUSDAmountSent: bigint, swapTime: number;
      try{
        const {busdAmount, swapTime: _swapTime} = await verifySwapTx(txHash, sender, network);
        BUSDAmountSent = busdAmount;
        swapTime = _swapTime;
        if (BUSDAmountSent > 0) {
          socket.emit(TransactionEvents.SWAP_VALIDITY, true);
        }else {
          socket.emit(TransactionEvents.SWAP_VALIDITY, false);
          return;
        }
      }catch(err){
        console.log(err.message);
        socket.emit(TransactionEvents.SWAP_VALIDITY, false);
        return;
      }

      const sendNairaCallback = createSendNairaCallback({
        bankCode,
        accountName,
        accountNumber,
        busdAmount: BUSDAmountSent,
        rates,
        socket,
        swapTime,
        network
      })

      // monitor confirmations and send fiat when confirmations are complete
      monitorTx(network, socket, txHash, 0, sendNairaCallback);
    })
  })
}

export default _txSocket;