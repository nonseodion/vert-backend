import { Schema, model } from "mongoose";
import { SupportedClient } from "../services/blockchain/config.blockchain";

const TxSchema = new Schema({
    hash: {type: String, required: true},
    chainId: {type: Number, required: true},
    exchangeId: {type: String},
  },
  {
    timestamps: true
  }
);

const TxModel = model("Transaction", TxSchema);

async function addTx(hash: string, chainId: keyof SupportedClient): Promise<void>{
  await TxModel.create({
    hash,
    chainId
  });
}

async function saveTxId(hash: string, id: string): Promise<void>{
  await TxModel.findOneAndUpdate(
    { hash },
    {exchangeId: id}
  )
}

async function txExists(hash: string, chainId: keyof SupportedClient): Promise<boolean>{
  const doc = await TxModel.exists({hash, chainId})
  return !!doc;
}

export {
  addTx,
  saveTxId,
  txExists
}
