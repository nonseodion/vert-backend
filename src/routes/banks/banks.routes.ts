import { Router } from "express";

import { getBanks, getAccountName, getBalance } from "./banks.controllers";

const router = Router();

// get banks list
router.get("/list", getBanks);

// get account detail
router.get("/accountName", getAccountName)

// get liquidity
router.get("/liquidity", getBalance)

export default router;
