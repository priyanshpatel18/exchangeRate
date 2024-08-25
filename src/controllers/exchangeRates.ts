import { Request, Response } from "express";
import { getExchangeRate } from "../services/exchangeRateService";

export const getExchangeRateController = async (req: Request, res: Response) => {
  // Get Currency from params
  const { currency } = req.params;

  try {
    // Get Exchange Rate from Redis
    const exchangeRate = await getExchangeRate(currency);
    if (!exchangeRate) {
      return res.status(404).json({ message: "Invalid Currency" });
    }
    return res.status(200).json({ currency, data: exchangeRate });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
