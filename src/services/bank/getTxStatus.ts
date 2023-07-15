import { EXCHANGETXSTATUS, coinprofileApi } from "./setup.bank";

type CoinprofileTx = {
  transactionId: string,
  status: EXCHANGETXSTATUS
}

type CoinprofileTxs = {
  data: CoinprofileTx[],
  total: number,
  perPage: number,
  page: string,
  pages: number
}


async function getTxStatus(txId: string, swapTime: number): Promise<EXCHANGETXSTATUS>{
  let pages = 1;
  let tx: CoinprofileTx;

  for(let i = 0; i < pages; i++){
    let coinprofileTxs: CoinprofileTxs;
    try{
      coinprofileTxs = (await coinprofileApi.get("transaction", {
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
      pages = coinprofileTxs.pages;
    }
    const txs = coinprofileTxs.data;
    tx = txs.find(tx => {
      console.log(tx.transactionId, txId)
      return tx.transactionId === txId
    }) 
    if(tx){
      break;
    }
  }

  return tx?.status;
}

export default getTxStatus;
