import banks from "../data/banks.json";

function getAllBanks (){
  return banks.map(bank => ({
    name: bank.name,
    shortname: bank.shortname,
    code: bank.code
  }))
}

function getAllBankCodes (){
  return banks.map(bank => bank.code)
}

export default {
  getAllBanks,
  getAllBankCodes
}