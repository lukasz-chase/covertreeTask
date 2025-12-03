import { jest } from "@jest/globals";
import { Prisma } from "@prisma/client";

export const mockPrisma: any = {
  property: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

export const mockWeatherstack: any = {
  getCurrentWeather: jest.fn(),
  extractLatLong: jest.fn(),
};

/**
 * Utility helper for simulating PrismaClientKnownRequestError.
 */
export const prismaErrorMock = (code: string) => {
  return new Prisma.PrismaClientKnownRequestError("Mocked error", {
    code,
    clientVersion: "7.1.0",
  });
};
