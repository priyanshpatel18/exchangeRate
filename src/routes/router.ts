import { Router } from "express";
import { getAllRatesController, getExchangeRateController } from "../controllers/exchangeRates";

const router = Router();

router
  .get("/exchangeRate/all", getAllRatesController)
  .get("/exchangeRate/:currency", getExchangeRateController)

export default router;
