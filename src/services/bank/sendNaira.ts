import { BankAccount, coinprofileSDKAuth } from "./setup.bank";
import banks from "../../data/banks.json";
import { Socket } from "socket.io";
import getRates, { Rates } from "./getRates";
import { formatUnits } from "viem";
import toTwoDecimalPlaces from "../../utils/toTwoDecimalPlaces";

type SendNairaParams = {
  bankAccount: BankAccount
  rates: Rates,
  busdAmount: bigint,
  socket: Socket
}

async function sendNaira(params: SendNairaParams){
  const { bankAccount, rates, socket, busdAmount } = params;
  const {bankCode, name: accountName, number: accountNumber} = bankAccount;
  const bankName = banks.find((bank) => bank.code === bankCode).name;
  const rateCorrect = true // verifyRate(rates);
  let rate: number;
  if(rateCorrect){
    rate = rates.data.rates.BUSDNGN
  }else {
    rate = (await getRates()).data.rates.BUSDNGN.rate;
  }

  // divide by 10**18
  const NGNAmount = toTwoDecimalPlaces(formatUnits(busdAmount * BigInt(rate), 18));

  const data = await coinprofileSDKAuth.withdrawBalance({
    otpType: 'otp',
    currency: 'NGN',
    accountNumber,
    accountName,
    bank: bankName,
    bankCode,
    amount: NGNAmount
  });

  console.log(data);
}

export default sendNaira;
