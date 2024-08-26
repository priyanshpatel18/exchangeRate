import prisma from "../config/db";
import redis from "../config/redis";
import { fetchLatestConversionRates } from "../services/externalApiService";

const famousCurrencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "NZD"];

export async function updateRates() {
  const latestRates = await fetchLatestConversionRates();

  Object.keys(latestRates).forEach(async (key) => {
    if (famousCurrencies.includes(key)) {
      let multiplier;
      switch (key) {
        case "JPY":
          multiplier = 1;
          break;
        default:
          multiplier = 100;
          break;
      }

      await prisma.exchangeRate.upsert({
        where: {
          currency: key
        },
        create: {
          currency: key,
          rate: latestRates[key],
          lastUpdated: new Date(),
          multiplier
        },
        update: {
          rate: latestRates[key],
          lastUpdated: new Date()
        }
      });

      // Set Exchange Rate in Redis
      redis.set(key, JSON.stringify({ data: latestRates[key], lastUpdated: new Date(), multiplier }));
    }
  });
}
