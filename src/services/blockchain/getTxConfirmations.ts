import { Hash } from "viem";
import { getClient } from "./config.blockchain";

// checks if the tx has not been reorged and returns the number of confirmations
async function getTxConfirmations(txHash: Hash, latestBlockNumber: bigint): Promise<number>{
  const blockchainClient = getClient("localhost");
  const txBlockNumber = (
    await blockchainClient.getTransaction({
      hash: txHash
    })
  )?.blockNumber as bigint;
  //TODO: handle no blockNumber

  const confirmations = Number(latestBlockNumber - txBlockNumber);
  return confirmations > 0 ? confirmations : 0;
}

export default getTxConfirmations;