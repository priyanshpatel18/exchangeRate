import "dotenv/config";
import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
  url: `https://${UPSTASH_REDIS_REST_URL}`,
  token: UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
