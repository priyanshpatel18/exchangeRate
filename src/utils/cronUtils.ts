import cron from "node-cron";
import { updateRates } from "../jobs/rateUpdater";

export async function startCron() {
  cron.schedule("0 0 * * *", async () => {
    try {
      await updateRates();
      console.log('Rates updated successfully.');
    } catch (error) {
      console.error('Error updating rates:', error);
    }
  })
}