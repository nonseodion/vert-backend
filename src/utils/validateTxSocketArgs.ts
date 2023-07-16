import validator from "validator";
import { Hash, Address } from "viem";
import { Rates } from "../services/bank/getRates";
import { validateAccountNumber, validateBankCode } from "./validateBankDetails";

function validateTxSocketArgs(
  txHash: Hash, sender: Address, bankCode: string, accountName: string, accountNumber: string
){
  if(!validator.isHexadecimal(txHash)){
    return {
      error: "Invalid transaction hash",
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

  return {
    valid: true, error: undefined
  };
}

export default validateTxSocketArgs
