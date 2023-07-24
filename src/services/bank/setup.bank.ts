import api from "api";
import banks from "../../data/banks.json";
import axios from "axios";
import "../../utils/setupEnv"
import { SupportedClient } from "../blockchain/config.blockchain";

const coinprofileSDKNoAuth = api("@coinprofile/v1.0#4vskx17nldeochjl");

const coinprofileStagingApi = axios.create({
  baseURL: 'https://staging-biz.coinprofile.co/v2/',
  headers: {
    "X-Api-User": process.env.COINPROFILE_USER, 
    "X-Api-Version": "1", 
    "X-Api-Key": process.env.COINPROFILE_API_KEY_STAGING
  }
});

const coinprofileProductionApi = axios.create({
  baseURL: 'https://biz.coinprofile.co/v2/',
  headers: {
    "X-Api-User": process.env.COINPROFILE_USER, 
    "X-Api-Version": "1", 
    "X-Api-Key": process.env.COINPROFILE_API_KEY_PRODUCTION
  }
});

const getExchangeApi = (network: SupportedClient) => {
  const apis = {
    [SupportedClient.LOCALHOST] : coinprofileStagingApi,
    [SupportedClient.BSC_TESTNET] : coinprofileStagingApi,
    [SupportedClient.BSC] : coinprofileProductionApi
  }
  return apis[network];
}

export {
  coinprofileSDKNoAuth,
  getExchangeApi
}

export type BankAccount = {
  number: string;
  name: string;
  bankCode:  typeof banks[number]["code"]
}

export enum EXCHANGETXSTATUS {
  PROCESSING = "processing",
  FULLFILED = "fullfiled",
  FAILED = "failed",
}
