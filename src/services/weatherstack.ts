import axios from "axios";

const WEATHERSTACK_BASE_URL = "https://api.weatherstack.com/current";

type WeatherstackLocation = {
  name: string;
  country: string;
  region: string;
  lat: string;
  lon: string;
};

type WeatherstackCurrent = {
  temperature: number;
  weather_descriptions: string[];
  weather_icons: string[];
  wind_speed: number;
  wind_degree: number;
  wind_dir: string;
  pressure: number;
  precip: number;
  humidity: number;
  cloudcover: number;
  feelslike: number;
  uv_index: number;
  visibility: number;
  [key: string]: unknown;
};

type WeatherstackResponse = {
  location: WeatherstackLocation;
  current: WeatherstackCurrent;
  error: WeatherstackError;
  [key: string]: unknown;
};

type AddressInput = {
  city: string;
  state: string;
  zipCode: string;
};

type WeatherstackError = {
  code: number;
  type: string;
  info: string;
};

/**
 * Creates a client for interacting with the Weatherstack API.
 * @param apiKey - The API key for authenticating with the Weatherstack service.
 * @returns An object with methods to interact with the Weatherstack API.
 */
export const createWeatherstackClient = (apiKey: string) => {
  /**
   * Fetches the current weather for a given address.
   * @param address - The address to get weather information for.
   * @returns A promise that resolves with the weather data from the API.
   */
  const getCurrentWeather = async (
    address: AddressInput,
  ): Promise<WeatherstackResponse> => {
    const query = `${address.zipCode} ${address.city}, ${address.state}, USA`;

    const response = await axios.get<WeatherstackResponse>(
      WEATHERSTACK_BASE_URL,
      {
        params: {
          access_key: apiKey,
          query,
        },
      },
    );
    const error = response.data.error;
    if (error) {
      throw new Error(error.info);
    }

    return response.data;
  };

  /**
   * Extracts and converts latitude and longitude from a location object to numbers.
   * @param location - The location object from a Weatherstack API response.
   * @returns An object containing the latitude and longitude as numbers.
   * @throws {Error} if the latitude or longitude values are not valid numbers.
   */
  const extractLatLong = (location: WeatherstackLocation) => {
    const lat = Number(location.lat);
    const long = Number(location.lon);

    if (Number.isNaN(lat) || Number.isNaN(long)) {
      throw new Error("Weatherstack returned invalid lat/lon values");
    }

    return { lat, long };
  };

  return { getCurrentWeather, extractLatLong };
};

export type WeatherstackClient = ReturnType<typeof createWeatherstackClient>;
