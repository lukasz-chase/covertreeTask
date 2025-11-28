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

export const createWeatherstackClient = (apiKey: string) => {
  const getCurrentWeather = async (
    address: AddressInput
  ): Promise<WeatherstackResponse> => {
    const query = `${address.zipCode} ${address.city}, ${address.state}, USA`;

    const response = await axios.get<WeatherstackResponse>(
      WEATHERSTACK_BASE_URL,
      {
        params: {
          access_key: apiKey,
          query,
        },
      }
    );
    const error = response.data.error;
    if (error) {
      throw new Error(error.info);
    }

    return response.data;
  };

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
