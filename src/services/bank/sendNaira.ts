import crypto from "node:crypto";

import { BankAccount, EXCHANGETXSTATUS, getExchangeApi } from "./setup.bank";
import banks from "../../data/banks.json";
import { Socket } from "socket.io";
import getRates, { Rates } from "./getRates";
import { Hash, formatUnits } from "viem";
import toTwoDecimalPlaces from "../../utils/toTwoDecimalPlaces";
import getTxStatus from "./getTxStatus";
import { TransactionEvents } from "../../sockets/events";
import { SupportedClient } from "../blockchain/config.blockchain";
import { saveTxId } from "../../model/transactions.model";

type SendNairaParams = {
  bankAccount: BankAccount,
  txHash: Hash
  rates: Rates,
  busdAmount: bigint,
  socket: Socket,
  network: SupportedClient,
  swapTime: number
}

async function sendNaira(params: SendNairaParams){
  const { bankAccount, rates, socket, busdAmount, swapTime, network, txHash } = params;
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
    try{
      rate = (await getRates()).data.rates.BUSDNGN.rate;
    }catch(err){
      console.log("sendNaira__Failed: failed to fetch rates: ", err.message);
      socket.emit(TransactionEvents.EXCHANGE_STATUS, EXCHANGETXSTATUS.FAILED);
      return;
    } 
  }


  const NGNAmount = toTwoDecimalPlaces(
    String(Math.ceil(
      +formatUnits(busdAmount * BigInt(rate*100), 20)
    ))
  );

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
        amount: NGNAmount
      }
    )).data;
    
    
    let active = false; // used to throttle fetch tx status

    const interval = setInterval(async () => {
      if(active === true) return;
        active = true;

        let status: EXCHANGETXSTATUS;
        try{
          console.log("fetching txStatus", result.data.withdrawal.transactionId);
          status = await getTxStatus(
            result.data.withdrawal.transactionId, 
            network,
            swapTime
          );
          console.log(result.data.withdrawal.transactionId, "txStatus:", status);
          if(status === EXCHANGETXSTATUS.FULLFILED){
            await saveTxId( txHash, `${process.env.EXCHANGE}-${result.data.withdrawal.transactionId}`);
          }
        }catch(err){
          // nothing done because we need the exchange status
          console.log("sendNaira_Failed_getTxStatusError:", err.message)
        }
        
        if(status === EXCHANGETXSTATUS.FULLFILED || status === EXCHANGETXSTATUS.FAILED){
          clearInterval(interval);
          socket.emit(TransactionEvents.EXCHANGE_STATUS, status);
          active = false;
          return;
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
