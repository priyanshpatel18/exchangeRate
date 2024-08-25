const apiKey = process.env.EXCHANGE_RATE_API_KEY;

export const fetchLatestConversionRates = async () => {
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`;
  const response = await fetch(url);
  const data = await response.json();
  return data.conversion_rates;
};
