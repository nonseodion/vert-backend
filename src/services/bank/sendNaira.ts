import crypto from "node:crypto";

import { BankAccount, EXCHANGETXSTATUS, getExchangeApi } from "./setup.bank";
import banks from "../../data/banks.json";
import { Socket } from "socket.io";
import getRates, { Rates } from "./getRates";
import { formatUnits } from "viem";
import toTwoDecimalPlaces from "../../utils/toTwoDecimalPlaces";
import getTxStatus from "./getTxStatus";
import { TransactionEvents } from "../../sockets/events";
import { SupportedClient } from "../blockchain/config.blockchain";

type SendNairaParams = {
  bankAccount: BankAccount
  rates: Rates,
  busdAmount: bigint,
  socket: Socket,
  network: SupportedClient,
  swapTime: number
}

async function sendNaira(params: SendNairaParams){
  const { bankAccount, rates, socket, busdAmount, swapTime, network } = params;
  const {bankCode, name: accountName, number: accountNumber} = bankAccount;
  const bankName = banks.find((bank) => bank.code === bankCode).name;
  const exchangeApi = getExchangeApi(network);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let rateCorrect = crypto.verify("SHA256", JSON.stringify(rates.data), process.env.PUBLIC_KEY, Buffer.from(rates.signature, "hex"));
  // timestamp must not exceed an hour
  rateCorrect = rateCorrect && rates.data.time + 60*60*1000 >= new Date().getTime()
  let rate: number;
  if(rateCorrect){
    rate = rates.data.rates.BUSDNGN.rate
  }else {
    rate = (await getRates()).data.rates.BUSDNGN.rate;
  }


  const NGNAmount = toTwoDecimalPlaces(formatUnits(busdAmount * BigInt(rate*100), 20));

  // divide by 10**18
  // TODO validate amount, amount must be >= 500
  try{
    const result = (await exchangeApi.post(
      "balance/withdraw",
      {
        otpType: 'otp',
        currency: 'NGN',
        accountNumber,
        accountName,
        bank: bankName,
        bankCode,
        amount: "500" // NGNAmount
      }
    )).data;
    
    
    let active = false; // used to throttle fetch tx status
    const maxRetries = 3;
    let retries = 0;

    const interval = setInterval(async () => {
      if(active === true) return;
        active = true;
        retries += 1;

        let status: EXCHANGETXSTATUS;
        try{
          status = await getTxStatus(
            result.data.withdrawal.transactionId, 
            network,
            swapTime
          );
        }catch(err){

          console.log("sendNaira_Failed_getTxStatusError:", err.message)
        }
        
        if(status === EXCHANGETXSTATUS.FULLFILED || status === EXCHANGETXSTATUS.FAILED){
          clearInterval(interval);
          socket.emit(TransactionEvents.EXCHANGE_STATUS, status);
          active = false;
          return;
        } 

        if(retries === maxRetries){
          clearInterval(interval);
          socket.emit(TransactionEvents.EXCHANGE_STATUS, EXCHANGETXSTATUS.FAILED)
        }
        active = false;
      }, 
      2500
    );

  }catch(err){
    socket.emit(TransactionEvents.EXCHANGE_STATUS, EXCHANGETXSTATUS.FAILED);
    console.log("sendNaira_Failed:", err.message);
  }
}

export default sendNaira;
