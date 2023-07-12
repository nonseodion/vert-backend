import crypto from "node:crypto";
import { coinprofileSDKNoAuth } from "./setup.bank";

export type Rates = {
  data: {
    rates: {
      BUSDNGN: {rate: number, key: string},
      BUSDUSD: {rate: number, key: string}
    time: number
  }},
  signature: string
}

async function getRates(){
  let rates: {[key:string]: {rate: number, key: string}};

  try{
    const data = (
      await coinprofileSDKNoAuth.getCurrentRates()
    ).data.data;

    rates = {
      BUSDNGN: data["BUSDNGN"],
      BUSDUSD: data["BUSDUSD"]
    };
  }catch(err){
    console.log(`rateFetch_Failed: ${err.message}`);
    throw Error(err);
  }
    
  // sign rates with a timestamp to ensure the client sends back correct rates
  // they are within a specific timeframe
  const data = {
    rates, time: new Date().getTime()
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const signature = crypto.sign("SHA256", JSON.stringify(data), process.env.PRIVATE_KEY)
    .toString("hex");

  return {data, signature}
}

export default getRates;
