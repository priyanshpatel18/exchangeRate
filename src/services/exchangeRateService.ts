import redis from "../config/redis";
import { updateRates } from "../jobs/rateUpdater";
import { Rate } from "../types/rate";
import { checkExpiredRates } from "../utils/dateUtils";

export async function getExchangeRate(currency: string) {
  try {
    let rate: Rate | null = await redis.get(currency);
    if (!rate) {
      return null;
    } if (!checkExpiredRates(new Date(rate.lastUpdated))) {
      return rate.data;
    }

    // Update Database
    await updateRates();
    rate = await redis.get(currency);

    if (rate) {
      return rate.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
}