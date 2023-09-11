import api from "api";
import banks from "../../data/banks.json";
import axios from "axios";
import "../../utils/setupEnv"
import { SupportedClient } from "../blockchain/config.blockchain";

const exchangeSDKNoAuth = api("@coinprofile/v1.0#4vskx17nldeochjl");

const exchangeStagingApi = axios.create({
  baseURL: 'https://staging-biz.coinprofile.co/v2/',
  headers: {
    "X-Api-User": process.env.EXCHANGE_USER, 
    "X-Api-Version": "1", 
    "X-Api-Key": process.env.EXCHANGE_API_KEY_STAGING
  }
});

const exchangeProductionApi = axios.create({
  baseURL: 'https://biz.coinprofile.co/v2/',
  headers: {
    "X-Api-User": process.env.EXCHANGE_USER, 
    "X-Api-Version": "1", 
    "X-Api-Key": process.env.EXCHANGE_API_KEY_PRODUCTION
  }
});

const getExchangeApi = (network: SupportedClient) => {
  const apis = {
    [SupportedClient.LOCALHOST] : exchangeStagingApi,
    [SupportedClient.BSC_TESTNET] : exchangeStagingApi,
    [SupportedClient.BSC] : exchangeProductionApi
  }
  return apis[network];
}

export {
  exchangeSDKNoAuth,
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
