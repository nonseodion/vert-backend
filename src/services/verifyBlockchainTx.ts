import { Address, TransactionReceipt, Hash, createPublicClient, decodeEventLog, http, getAddress } from "viem";
import { bscTestnet, localhost } from "viem/chains";

import receivers from "../data/receivers.json";
import routers from "../data/routers.json";
import routerAbi from "../data/abis/router.json";

type Topics = [] | [signature: `0x${string}`, ...args: `0x${string}`[]]

const SellEventSignature = "0xa90e25af8f532db6a04ac99d7101fca78edb7b6c9507535d6e86146407204dcc";
const blockchainClient = createPublicClient({
  chain: localhost,
  transport: http()
});

async function checkBlockchainTx(txHash: Hash, senderAddress: Address, tokenAddress: Address, amount: number){
  const txReceipt: TransactionReceipt = await blockchainClient.getTransactionReceipt({ hash: txHash});
  const {logs: _logs, from, to } = txReceipt;

  const logs  = _logs as unknown as (typeof _logs[0] & {topics: [] | [signature: `0x${string}`, ...args: `0x${string}`[]]}) [];

  if(getAddress(senderAddress) !== getAddress(from)){
    console.log(`checkBlockchainTx_Failure: ${txHash} sender is different. Original sender: ${from}. Wrong sender: ${senderAddress}`)
  }
  if(getAddress(to) !== getAddress(routers[0])){
    console.log(`checkBlockchainTx_Failure: ${txHash} sent to a wrong router: ${to}`)
  }
  
  for(const log of logs ){

    if(log.address !== routers[0] && (log.topics?.[0] !== SellEventSignature)) continue;
    const sellEventLog = decodeEventLog({
      data: log.data,
      abi: routerAbi,
          
      topics: log.topics, // tslint:disable-line
      eventName: "Sell"
    });

    console.log(sellEventLog)
  }
}

export default checkBlockchainTx;