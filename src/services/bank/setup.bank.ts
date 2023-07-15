import api from "api";
import banks from "../../data/banks.json";
import axios from "axios";
import "../../utils/setupEnv"

const coinprofileSDKNoAuth = api("@coinprofile/v1.0#4vskx17nldeochjl");

const coinprofileApi = axios.create({
  baseURL: 'https://staging-biz.coinprofile.co/v2/',
  headers: {
    "X-Api-User": process.env.COINPROFILE_USER, 
    "X-Api-Version": "1", 
    "X-Api-Key": process.env.COINPROFILE_API_KEY_STAGING
  }
});

export {
  coinprofileSDKNoAuth,
  coinprofileApi
}

export type BankAccount = {
  number: number;
  name: string;
  bankCode:  typeof banks[number]["code"]
}

export enum EXCHANGETXSTATUS {
  FULLFILED = "fullfiled",
  FAILED = "failed",
}
