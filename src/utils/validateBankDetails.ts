import validator from "validator";

import banksModel from "../model/banks.model"

function validateBankCode(bankCode: string){
  const valid = validator.isIn(bankCode, banksModel.getAllBankCodes())
  return {
    valid,
    error: valid ? undefined : "bank_code is not a supported bank code"
  }
}

function validateAccountNumber(accountNumber: string){
   // verify account number
  const numeric = validator.isNumeric(
    accountNumber, 
    {no_symbols: true}
  );
  if(!numeric) {
    return{
      valid: false,
      error: "account_number isn't a number"
    }
  }
  if(accountNumber.length !== 10){
    return{
      isValid: false,
      error: "account_number must have 10 digits"
    }
  }

  return {
    valid: true,
    error: undefined
  }
}

export {
  validateBankCode,
  validateAccountNumber
}
