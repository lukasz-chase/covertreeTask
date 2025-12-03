import { jest } from "@jest/globals";

export const mockPrisma = {
  property: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

export const mockWeatherstack = {
  getCurrentWeather: jest.fn(),
  extractLatLong: jest.fn(),
};
