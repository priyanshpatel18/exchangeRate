import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/middleware";
import exchangeRateRoutes from "./routes/router";
import { startCron } from "./utils/cronUtils";
import cors from "cors";

const app = express();

app.use(express.json());
app.use("/api", exchangeRateRoutes);
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  console.log(`Server is running on PORT ${PORT}`);

  try {
    await startCron();
    console.log('Cron started successfully');
  } catch (error) {
    console.error('Error starting cron:', error);
  }
});