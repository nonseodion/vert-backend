import { Server } from "socket.io";

import verifySwapTx from "../services/blockchain/verifySwapTx";
import { Address, Hash } from "viem";
import { getClient } from "../services/blockchain/config.blockchain";
import monitorTx from "../services/blockchain/monitorTx";
import { TransactionEvents } from "./events";
import { Rates } from "../services/bank/getRates";
import createSendNairaCallback from "../utils/createSendNairaCallback";
import validateTxSocketArgs from "../utils/validateTxSocketArgs";



function _txSocket(io: Server){
  const txSocket = io.of("/transactions");

  txSocket.on("connection", (socket) => {
    // triggered when a swap is comlete on the frontend
    socket.on(TransactionEvents.SWAP, async (
      txHash: Hash, sender: Address, bankCode: string, accountName: string, accountNumber: string, rates: Rates
    ) => {
      const {error, valid} = validateTxSocketArgs(txHash, sender, bankCode, accountName, accountNumber);
      console.log(error, valid);
      if(!valid){
        socket.emit(TransactionEvents.ARG_VALIDITY, error);
        return;
      }

      let BUSDAmountSent: bigint, swapTime: number;
      try{
        const {busdAmount, swapTime: _swapTime} = await verifySwapTx(txHash, sender);
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

      const blockchainClient = getClient("localhost");
      const sendNairaCallback = createSendNairaCallback({
        bankCode,
        accountName,
        accountNumber,
        busdAmount: BUSDAmountSent,
        rates,
        socket,
        swapTime
      })
      // monitor confirmations and send fiat when confirmations are complete
      monitorTx(blockchainClient, socket, txHash, 0, sendNairaCallback);
    })
  })
}

export default _txSocket;