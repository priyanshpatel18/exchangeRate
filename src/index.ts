import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import db from "./db";

const app = express();
const apiKey = process.env.EXCHANGE_RATE_API_KEY;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// Functions
function checkExpiredRates(date: Date) {
  const currentDate = new Date();

  const year1 = date.getFullYear();
  const month1 = date.getMonth();
  const day1 = date.getDate();

  const year2 = currentDate.getFullYear();
  const month2 = currentDate.getMonth();
  const day2 = currentDate.getDate();

  if (year1 < year2) {
    return true;
  } else if (year1 === year2 && month1 < month2) {
    return true;
  } else if (year1 === year2 && month1 === month2 && day1 < day2) {
    return true;
  } else {
    return false;
  }
}
async function getRate(currency: string) {
  const exchangeRate = await db.exchangeRate.findFirst({
    where: {
      currency
    }
  });
  return exchangeRate;
}
async function getConversionRate() {
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`;

  const response = await fetch(url);
  const data = await response.json();

  const conversion_rates: { [key: string]: number } = data.conversion_rates;

  return conversion_rates;
}

// Logic
app.get("/exchangeRate/:currency", async (req: Request, res: Response) => {
  const { currency } = req.params;
  if (!currency) {
    return res.status(400).json({ message: "Invalid currency" });
  }

  try {
    const existingRates = await db.exchangeRate.findFirst({
      where: { currency: "INR" },
    });
    

    if (!existingRates) {
      const conversionRates = await getConversionRate(); 
      
      if (!conversionRates) {
        return res.status(400).json({ message: "Invalid API Key" });
      }

      await Promise.all(
        Object.entries(conversionRates).map(([currency, rate]: [string, number]) =>
          db.exchangeRate.create({
            data: { currency, rate, lastUpdated: new Date() }
          })
        )
      );
    } else if (checkExpiredRates(existingRates.lastUpdated)) {
      const conversionRates = await getConversionRate();
      
      if (!conversionRates) {
        return res.status(400).json({ message: "Invalid API Key" });
      }

      await Promise.all(
        Object.entries(conversionRates).map(([currency, rate]: [string, number]) =>
          db.exchangeRate.upsert({
            where: { currency },
            update: { rate, lastUpdated: new Date() },
            create: { currency, rate, lastUpdated: new Date() }
          })
        )
      );
    }

    const exchangeRate = await getRate(currency);
    
    if (!exchangeRate) {
      return res.status(404).json({ message: "Exchange rate not found" });
    }

    return res.status(200).json({ exchangeRate });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});