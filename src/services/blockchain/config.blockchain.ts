import { createPublicClient, http } from "viem";
import { localhost, bsc, bscTestnet } from "viem/chains";


const localhostClient = createPublicClient({
  chain: localhost,
  transport: http()
});

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

const clients = {
  bsc: bscClient, bscTestnet: bscTestnetClient, localhost: localhostClient
}

function getClient(client: SupportedClient) {
  return clients[client];
} 


export {
  getClient
}