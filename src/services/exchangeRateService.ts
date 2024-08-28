import redis from "../config/redis";
import { famousCurrencies, updateRates } from "../jobs/rateUpdater";
import { Rate } from "../types/rate";
import { checkExpiredRates } from "../utils/dateUtils";

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: Date;
  multiplier: number;
}

async function fetchRatesFromRedis(): Promise<Rate[] | null> {
  try {
    const ratesData = await redis.mget(famousCurrencies);
    if (!ratesData || !Array.isArray(ratesData)) {
      return null;
    }
    return ratesData.filter((rate): rate is Rate => rate !== null);
  } catch (error) {
    console.error('Error fetching rates from Redis:', error);
    return null;
  }
}

function formatRates(rates: Rate[]): ExchangeRate[] {
  return rates.map((rate) => ({
    currency: rate.currency,
    rate: rate.rate,
    lastUpdated: rate.lastUpdated,
    multiplier: rate.multiplier
  }));
}

export async function getAllRates() {
  try {
    let rates = await fetchRatesFromRedis();

    if (rates && rates.length > 0 && !checkExpiredRates(new Date(rates[0].lastUpdated))) {
      return formatRates(rates);
    }

    await updateRates();
    rates = await fetchRatesFromRedis();
    if (rates && rates.length > 0 && !checkExpiredRates(new Date(rates[0].lastUpdated))) {
      return formatRates(rates);
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

export async function getExchangeRate(currency: string) {
  try {
    let rate: ExchangeRate | null = await redis.get(currency);
    if (!rate) {
      return null;
    } if (!checkExpiredRates(new Date(rate.lastUpdated))) {
      return {
        exchangeRate: rate.rate,
        multiplier: rate.multiplier,
      };
    }

    // Update Database
    await updateRates();
    rate = await redis.get(currency);

    if (rate) {
      return {
        exchangeRate: rate.rate,
        multiplier: rate.multiplier,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
}