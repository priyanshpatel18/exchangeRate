import { Request, Response } from "express";
import { getAllRates, getExchangeRate } from "../services/exchangeRateService";

export const getAllRatesController = async (req: Request, res: Response) => {
  try {
    const response = await getAllRates();

    return res.status(200).json({ data: response });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getExchangeRateController = async (req: Request, res: Response) => {
  // Get Currency from params
  const { currency } = req.params;
  const value = req.query.value ? Number(req.query.value) : null;

  try {
    // Get Exchange Rate from Redis
    const response = await getExchangeRate(currency);
    if (!response?.exchangeRate) {
      return res.status(404).json({ message: "Invalid Currency" });
    }

    if (value && !isNaN(value)) {
      const amount = response.multiplier * response.exchangeRate * value
      return res.status(200).json({ currency, exchangeRate: response.exchangeRate, value: amount });
    } else {
      return res.status(200).json({ currency, exchangeRate: response.exchangeRate });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
