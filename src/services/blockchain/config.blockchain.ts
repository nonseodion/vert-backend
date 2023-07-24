import { createPublicClient, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";


const bscClient = createPublicClient({
  chain: bsc,
  transport: http()
});

const bscTestnetClient = createPublicClient({
  chain: bscTestnet,
  transport: http()
});

export enum SupportedClient {
  BSC = "bsc",
  BSC_TESTNET = "bscTestnet",
  LOCALHOST = "localhost"
}

export enum ChainIds {
  bsc = 56,
  bscTestnet = 97
}

const clients = {
  bsc: bscClient, bscTestnet: bscTestnetClient
}

function getClient(client: SupportedClient) {
  return clients[client];
} 


export {
  getClient
}