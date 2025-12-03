import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { createWeatherstackClient } from "../../services/weatherstack";

const mock = new AxiosMockAdapter(axios);

const API_KEY = "TEST_KEY";
const client = createWeatherstackClient(API_KEY);

describe("WeatherstackClient", () => {
  beforeEach(() => {
    mock.reset();
  });

  describe("getCurrentWeather", () => {
    it("calls Weatherstack API with correct params and returns data", async () => {
      const fakeResponse = {
        location: {
          name: "Austin",
          country: "USA",
          region: "Texas",
          lat: "30.2",
          lon: "-97.7",
        },
        current: {
          temperature: 22,
          weather_descriptions: ["Sunny"],
          humidity: 50,
        },
        error: null,
      };

      mock
        .onGet("https://api.weatherstack.com/current", {
          params: {
            access_key: API_KEY,
            query: "73301 Austin, TX, USA",
          },
        })
        .reply(200, fakeResponse);

      const result = await client.getCurrentWeather({
        city: "Austin",
        state: "TX",
        zipCode: "73301",
      });

      expect(result).toEqual(fakeResponse);
    });

    it("throws an error when Weatherstack returns an API error", async () => {
      mock.onGet("https://api.weatherstack.com/current").reply(200, {
        error: {
          code: 615,
          type: "request_failed",
          info: "Invalid API request",
        },
      });

      await expect(
        client.getCurrentWeather({
          city: "Austin",
          state: "TX",
          zipCode: "73301",
        }),
      ).rejects.toThrow("Invalid API request");
    });
  });

  describe("extractLatLong", () => {
    it("returns numeric lat/long from Weatherstack location", () => {
      const result = client.extractLatLong({
        name: "Austin",
        country: "USA",
        region: "Texas",
        lat: "30.2672",
        lon: "-97.7431",
      });

      expect(result).toEqual({
        lat: 30.2672,
        long: -97.7431,
      });
    });

    it("throws for invalid numeric values", () => {
      expect(() =>
        client.extractLatLong({
          name: "Austin",
          country: "USA",
          region: "Texas",
          lat: "ABC",
          lon: "XYZ",
        }),
      ).toThrow("Weatherstack returned invalid lat/lon values");
    });
  });
});
