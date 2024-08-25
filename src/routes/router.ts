import { Router } from "express";
import { getExchangeRateController } from "../controllers/exchangeRates";

const router = Router();

router.get("/exchangeRate/:currency", getExchangeRateController);

export default router;
