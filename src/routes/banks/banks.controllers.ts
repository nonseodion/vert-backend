import { Request, Response } from "express";
import validator from "validator";

import banksModel from "../../model/banks.model"
import { getAccountName as _getAccountName } from "../../services/bank/getAccountName";
import _getBalance from "../../services/bank/getBalance";

function getBanks(_, res: Response){
  return res.status(200).json(banksModel.getAllBanks());
}

interface GetAccountNameParams {
  account_number: string,
  bank_code: string
}

async function getAccountName(req: Request<Record<string, never>,any,any,GetAccountNameParams>, res: Response){
  const { account_number, bank_code } = req.query;

  // verify account number
  const numeric = validator.isNumeric(
    account_number, 
    {no_symbols: true}
  );
  if(!numeric) {
    return res.status(400).json({
      error: "account_number isn't a number"
    })
  }
  if(account_number.length !== 10){
    return res.status(400).json({
      error: "account_number must have 10 digits"
    })
  }

  // verify bank code
  const isValid = validator.isIn(bank_code, banksModel.getAllBankCodes())
  if(!isValid){
    return res.status(400).json({
      error: "bank_code is not a supported bank code"
    })
  }

  // resolve account
  let account_name: string;
  try{
    account_name = await _getAccountName(bank_code, account_number);
  }catch(err){
    return res.status(400).json({ error: err.message }) 
  }

  return res.status(200).json({
    account_number, account_name, bank_code
  })
}


async function getBalance (req, res: Response){
  const {network} = req.query;
  let balance;
  try{
    balance = await _getBalance(network);
  }catch(err){
    return res.status(400).json({error: err.message})
  }

  return res.status(200).json({amount: balance.amount, formattedAmount: balance.formattedAmount});
}

export { getBanks, getAccountName, getBalance } 