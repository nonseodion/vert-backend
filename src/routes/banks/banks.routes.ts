import { Router } from "express";

import { getBanks, getAccountName } from "./banks.controllers";

const router = Router();

// get banks list
router.get("/list", getBanks);

// get account detail
router.get("/accountName", getAccountName)

export default router;
