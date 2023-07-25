import { Server } from "socket.io";

import verifySwapTx from "../services/blockchain/verifySwapTx";
import { Address, Hash } from "viem";
import { ChainIds, SupportedClient, getClient } from "../services/blockchain/config.blockchain";
import monitorTx from "../services/blockchain/monitorTx";
import { TransactionEvents } from "./events";
import { Rates } from "../services/bank/getRates";
import createSendNairaCallback from "../utils/createSendNairaCallback";
import validateTxSocketArgs from "../utils/validateTxSocketArgs";
import { addTx } from "../model/transactions.model";

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

      const {error, valid} = await validateTxSocketArgs(txHash, sender, bankCode, accountName, accountNumber, network);

      if(!valid){
        console.log(`${socket.id}_argsValidityFailure:`, error);
        socket.emit(TransactionEvents.ARG_VALIDITY, false);
        return;
      }

      let BUSDAmountSent: bigint, swapTime: number;
      try{
        const {busdAmount, swapTime: _swapTime} = await verifySwapTx(txHash, sender, network);

        // save tx hash
        if(network !== "localhost"){
          await addTx(txHash, ChainIds[network]);
        }

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
        txHash,
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