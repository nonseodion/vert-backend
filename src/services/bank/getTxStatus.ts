import { SupportedClient } from "../blockchain/config.blockchain";
import { EXCHANGETXSTATUS, getExchangeApi } from "./setup.bank";

type ExchangeTx = {
  transactionId: string,
  status: EXCHANGETXSTATUS
}

type ExchangeTxs = {
  data: ExchangeTx[],
  total: number,
  perPage: number,
  page: string,
  pages: number
}


async function getTxStatus(txId: string, network: SupportedClient, swapTime: number): Promise<EXCHANGETXSTATUS>{
  let pages = 1;
  let tx: ExchangeTx;
  const exchangeApi = getExchangeApi(network);

  for(let i = 0; i < pages; i++){
    let exchangeTxs: ExchangeTxs;
    try{
      exchangeTxs = (await exchangeApi.get("transaction", {
        params: {
          currency: 'NGN',
          page: i + 1,
          limit: '50',
          duration: 'one day'
        }
      })).data.data;
    }catch(err){
      console.log("getTxStatus_Failed: ", err.message);
      throw new Error(err);
    }

    if(i === 0){
      pages = exchangeTxs.pages;
    }
    const txs = exchangeTxs.data;
    tx = txs.find(tx => {
      return tx.transactionId === txId
    }) 
    if(tx){
      break;
    }
  }

  return tx?.status;
}

export default getTxStatus;
