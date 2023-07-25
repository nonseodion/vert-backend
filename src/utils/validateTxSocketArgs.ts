import validator from "validator";
import { Hash, Address } from "viem";
import { validateAccountNumber, validateBankCode } from "./validateBankDetails";
import { ChainIds, SupportedClient } from "../services/blockchain/config.blockchain";
import {txExists} from "../model/transactions.model";

async function validateTxSocketArgs(
  txHash: Hash, sender: Address, bankCode: string, accountName: string, accountNumber: string, network: SupportedClient
){
  if(!validator.isHexadecimal(txHash)){
    return {
      error: "Invalid transaction hash",
      valid: false
    }
  }
  if(await txExists(txHash, ChainIds[network])){
    return {
      error: `Tx already processed. Hash: ${txHash}`,
      valid: false
    }
  }

  if(!validator.isHexadecimal(sender)){
    return {
      error: "Invalid sender",
      valid: false
    }
  }
  
  const accountNumberValidity = validateAccountNumber(accountNumber);
  if(!accountNumberValidity.valid){
    return {
      error: accountNumberValidity.error,
      valid: accountNumberValidity.valid
    }
  }

  const bankCodeValidity = validateBankCode(bankCode);
  if(!bankCodeValidity.valid){
    return {
      error: bankCodeValidity.error,
      valid: bankCodeValidity.valid,
    }
  }

  if(+accountName.length === 0){
    return {
        valid: false, error: "account_name cannot be empty"
    }
  }

  if(!Object.values(SupportedClient).includes(network)){
    return {
      valid: false, error: `${network} not supported`
    }
  }

  return {
    valid: true, error: undefined
  };
}

export default validateTxSocketArgs
