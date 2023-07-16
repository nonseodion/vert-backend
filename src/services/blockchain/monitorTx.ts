import { Socket } from "socket.io";
import getTxConfirmations from "./getTxConfirmations";
import { Hash } from "viem";
import { TransactionEvents } from "../../sockets/events";
import { SupportedClient, getClient } from "./config.blockchain";

// minimum no. of confirmations needed to confirm swap
const minConfirmations = 5;
const maxRetries = 3;

// monitors the tx for block reorgs and makes payout when it has enough confirmatiions.
// uses recursion to handle reorgs. Check the catch block.

function monitorTx(network: SupportedClient, socket: Socket, txHash: Hash, retries: number, sendNaira: () => void){

  const unWatchBlocks = getClient(network).watchBlockNumber({
    onBlockNumber: async (blockNumber: bigint) => {
      try{
        const confirmtions = await getTxConfirmations(network, txHash, blockNumber);
        socket.emit(TransactionEvents.TX_CONFIRMATIONS, confirmtions);
        
        if(confirmtions >= minConfirmations){
          unWatchBlocks();
          socket.emit(TransactionEvents.TX_CONFIRMATIONS_STATUS, true);
          // sends naira to the recipient bank account
          sendNaira();
        }
      }catch(err){
        // handles reorgs
        console.log(err.message);
        unWatchBlocks();

        if(retries >= maxRetries){
          console.log(`monitorTx_Failed: ${txHash} not found on the blockchain`)
          socket.emit(TransactionEvents.TX_CONFIRMATIONS_STATUS, false);
          return;
        }

        setTimeout(() => monitorTx(network, socket, txHash, ++retries, sendNaira), 10000);
      }
    }
  });
}

export default monitorTx;
