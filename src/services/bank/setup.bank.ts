import api from "api";
import banks from "../../data/banks.json";

const coinprofileSDKNoAuth = api("@coinprofile/v1.0#4vskx17nldeochjl");
const coinprofileSDKAuth = api("@coinprofile/v1.0#4vskx17nldeochjl");

coinprofileSDKAuth.auth('nonseodion');
coinprofileSDKAuth.auth(process.env.COINPROFILE_API_KEY_STAGING);
coinprofileSDKAuth.auth('1');

export {
  coinprofileSDKNoAuth,
  coinprofileSDKAuth
}

export type BankAccount = {
  number: number;
  name: string;
  bankCode:  typeof banks[number]["code"]
}