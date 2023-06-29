import axios from "axios"

interface AccountResponse {
  data: {
    account_number: string,
    account_name: string
  },

  message: string
}

async function getAccountName(bankCode: string, accountNumber: string): Promise<string>{
  try{
    const response = await axios.get<AccountResponse>(process.env.RESOLVE_ACCOUNT_API, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      },
      params: {
        account_number: accountNumber,
        bank_code: bankCode
      }
    });
    
    return response.data.data.account_name;
  }catch(err){
    console.log("getAccountName_FAILED:", err.response.data);
    throw Error(`Could not fetch account name`);
  }
}

export {
  getAccountName 
}