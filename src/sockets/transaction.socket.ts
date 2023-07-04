import { Server } from "socket.io";
import banks from "../data/banks.json";
import verifySwapTx from "../services/blockchain/verifySwapTx";
import { Hash } from "viem";
import { getClient } from "../services/blockchain/config.blockchain";
import getTxConfirmations from "../services/blockchain/getTxConfirmations";

type BankAccount = {
  number: number;
  name: string;
  bank:  typeof banks[number]["id"]
}

// minimum no. of confirmations needed to confirm swap
const minConfirmations = 15;

function _txNameSpace(io: Server){
  const txNameSpace = io.of("/transactions");

  txNameSpace.on("connection", (socket) => {
    socket.on("swap", async (txHash: Hash, sender: Hash, bankAccount: BankAccount) => {
      const BUSDAmountSent = await verifySwapTx(txHash, sender);
      if (BUSDAmountSent > 0) {
        socket.emit("swapValidity", true);
      }else {
        socket.emit("swapValidity", false)
      }

      // check confirmations and send fiat when confirmations are complete
      const blockchainClient = getClient("localhost");

      // weird usage of watching blocks
      const unWatchBlocks = blockchainClient.watchBlockNumber({
        onBlockNumber: async (blockNumber) => {
          const confirmtions = await getTxConfirmations(txHash, blockNumber);
          socket.emit("txConfirmations", confirmtions);

          if(confirmtions > minConfirmations){
            unWatchBlocks();
            //TODO: send fiat to bank account

          }
        }
      });

    })
  })
}

export default _txNameSpace;