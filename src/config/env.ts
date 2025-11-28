import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, required = true): string | undefined => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  port: parseInt(getEnv("PORT", false) || "4000", 10),
  weatherstackApiKey: getEnv("WEATHERSTACK_API_KEY")!,
  databaseUrl: getEnv("DATABASE_URL")!,
};
