import prisma from "../config/db";
import redis from "../config/redis";
import { fetchLatestConversionRates } from "../services/externalApiService";

export async function updateRates() {
  const latestRates = await fetchLatestConversionRates();

  Object.keys(latestRates).forEach(async (key) => {
    // Update Database
    await prisma.exchangeRate.upsert({
      where: {
        currency: key
      },
      create: {
        currency: key,
        rate: latestRates[key],
        lastUpdated: new Date()
      },
      update: {
        rate: latestRates[key],
        lastUpdated: new Date()
      }
    })
    // Set Exchange Rate in Redis
    redis.set(key, { data: latestRates[key], lastUpdated: new Date() });
  })
}