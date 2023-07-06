import { Server } from "socket.io";
import banks from "../data/banks.json";
import verifySwapTx from "../services/blockchain/verifySwapTx";
import { Hash } from "viem";
import { getClient } from "../services/blockchain/config.blockchain";
import monitorTx from "../services/blockchain/monitorTx";
import { TransactionEvents } from "./events";

type BankAccount = {
  number: number;
  name: string;
  bank:  typeof banks[number]["id"]
}

function _txNameSpace(io: Server){
  const txNameSpace = io.of("/transactions");

  txNameSpace.on("connection", (socket) => {
    // set when a swap is comlete on the frontend
    socket.on(TransactionEvents.SWAP, async (txHash: Hash, sender: Hash, bankAccount: BankAccount, rates: any) => {

      try{
        const BUSDAmountSent = await verifySwapTx(txHash, sender);
        if (BUSDAmountSent > 0) {
          socket.emit(TransactionEvents.SWAP_VALIDITY, true);
        }else {
          socket.emit(TransactionEvents.SWAP_VALIDITY, false)
        }
      }catch(err){
        console.log(err.message);
        socket.emit(TransactionEvents.SWAP_VALIDITY, false);
        return;
      }

      const blockchainClient = getClient("localhost");
      
      // monitor confirmations and send fiat when confirmations are complete
      monitorTx(blockchainClient, socket, txHash, 0, rates);
    })
  })
}

export default _txNameSpace;