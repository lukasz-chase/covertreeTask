import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GraphQLError } from "graphql";
import {
  propertyResolvers,
  GraphQLContext,
} from "../../resolvers/property.resolvers";
import { mockPrisma, mockWeatherstack } from "../helpers/mockContext";

// 🔹 importujemy całe repo, żeby móc je zamockować
import * as propertyRepo from "../../repositories/property.repository";

// 🔹 zamieniamy moduł repo na mocka Jesta
jest.mock("../../repositories/property.repository");

const repoMock = propertyRepo as jest.Mocked<typeof propertyRepo>;

const makeContext = (): GraphQLContext => ({
  prisma: mockPrisma as any,
  weatherstackClient: mockWeatherstack as any,
});

describe("propertyResolvers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // -------------------------------------------------------
  // QUERY: properties
  // -------------------------------------------------------
  describe("Query.properties", () => {
    it("deleguje do findProperties z poprawnym filtrem i sortOrder", async () => {
      const ctx = makeContext();

      // co ma zwrócić repo
      const fakeList = [
        {
          id: "1",
          city: "NY",
          street: "123",
          state: "NY",
          zipCode: "10001",
          lat: 1,
          long: 2,
          weatherData: { temp: 15 },
          createdAt: new Date(),
        },
      ];

      repoMock.findProperties.mockResolvedValue(fakeList as any);

      // UWAGA: przez typy z codegena (Resolver | { resolve }) robimy cast na any
      const resolver = propertyResolvers.Query!.properties as any;

      const result = await resolver(
        {}, // parent
        { filter: { city: "NY" }, sortOrder: "ASC" }, // args
        ctx,
        {} as any // info
      );

      // sprawdzamy, że repo wołane z odpowiednio zmapowanym filtrem
      expect(repoMock.findProperties).toHaveBeenCalledWith(ctx.prisma, {
        filter: { city: "NY", state: undefined, zipCode: undefined },
        sortOrder: "ASC",
      });

      expect(result).toEqual(fakeList);
    });

    it("przekazuje filter = undefined, gdy brak filter w args", async () => {
      const ctx = makeContext();

      repoMock.findProperties.mockResolvedValue([] as any);

      const resolver = propertyResolvers.Query!.properties as any;

      await resolver({}, { sortOrder: "DESC" }, ctx, {} as any);

      expect(repoMock.findProperties).toHaveBeenCalledWith(ctx.prisma, {
        filter: undefined,
        sortOrder: "DESC",
      });
    });
  });

  // -------------------------------------------------------
  // QUERY: property
  // -------------------------------------------------------
  describe("Query.property", () => {
    it("zwraca pojedynczą nieruchomość gdy istnieje", async () => {
      const ctx = makeContext();

      const fake = {
        id: "10",
        city: "LA",
        street: "Sunset Blvd",
        state: "CA",
        zipCode: "90001",
        lat: 33,
        long: -118,
        weatherData: { temp: 30 },
        createdAt: new Date(),
      };

      repoMock.findPropertyById.mockResolvedValue(fake as any);

      const resolver = propertyResolvers.Query!.property as any;

      const result = await resolver({}, { id: "10" }, ctx, {} as any);

      expect(repoMock.findPropertyById).toHaveBeenCalledWith(ctx.prisma, "10");
      expect(result).toEqual(fake);
    });

    it("rzuca NOT_FOUND gdy nieruchomość nie istnieje", async () => {
      const ctx = makeContext();

      repoMock.findPropertyById.mockResolvedValue(null);

      const resolver = propertyResolvers.Query!.property as any;

      await expect(
        resolver({}, { id: "X" }, ctx, {} as any)
      ).rejects.toMatchObject({
        message: "Property with id X not found",
        extensions: { code: "NOT_FOUND" },
      });
    });
  });

  // -------------------------------------------------------
  // MUTATION: createProperty
  // -------------------------------------------------------
  describe("Mutation.createProperty", () => {
    it("pobiera pogodę, tworzy property i zwraca ją", async () => {
      const ctx = makeContext();

      mockWeatherstack.getCurrentWeather.mockResolvedValue({
        current: { temp: 20 },
        location: { lat: 11, lon: 22 },
      });

      mockWeatherstack.extractLatLong.mockReturnValue({
        lat: 11,
        long: 22,
      });

      const created = {
        id: "ABC",
        city: "Austin",
        street: "5th Street",
        state: "TX",
        zipCode: "73301",
        lat: 11,
        long: 22,
        weatherData: { temp: 20 },
        createdAt: new Date(),
      };

      repoMock.createProperty.mockResolvedValue(created as any);

      const resolver = propertyResolvers.Mutation!.createProperty as any;

      const result = await resolver(
        {},
        {
          input: {
            city: "Austin",
            street: "5th Street",
            state: "TX",
            zipCode: "73301",
          },
        },
        ctx,
        {} as any
      );

      expect(mockWeatherstack.getCurrentWeather).toHaveBeenCalledWith({
        city: "Austin",
        state: "TX",
        zipCode: "73301",
      });

      expect(mockWeatherstack.extractLatLong).toHaveBeenCalledWith({
        lat: 11,
        lon: 22,
      });

      expect(repoMock.createProperty).toHaveBeenCalledWith(ctx.prisma, {
        city: "Austin",
        street: "5th Street",
        state: "TX",
        zipCode: "73301",
        lat: 11,
        long: 22,
        weatherData: { temp: 20 },
      });

      expect(result).toEqual(created);
    });

    it("rzuca ALREADY_EXISTS gdy repo zwróci null", async () => {
      const ctx = makeContext();

      mockWeatherstack.getCurrentWeather.mockResolvedValue({
        current: { temp: 20 },
        location: { lat: 11, lon: 22 },
      });

      mockWeatherstack.extractLatLong.mockReturnValue({
        lat: 11,
        long: 22,
      });

      repoMock.createProperty.mockResolvedValue(null);

      const resolver = propertyResolvers.Mutation!.createProperty as any;

      await expect(
        resolver(
          {},
          {
            input: {
              city: "Austin",
              street: "5th Street",
              state: "TX",
              zipCode: "73301",
            },
          },
          ctx,
          {} as any
        )
      ).rejects.toMatchObject({
        message: "Property already exists",
        extensions: { code: "ALREADY_EXISTS" },
      });
    });
  });

  // -------------------------------------------------------
  // MUTATION: deleteProperty
  // -------------------------------------------------------
  describe("Mutation.deleteProperty", () => {
    it("zwraca true gdy deletePropertyById zwróci true", async () => {
      const ctx = makeContext();

      repoMock.deletePropertyById.mockResolvedValue(true);

      const resolver = propertyResolvers.Mutation!.deleteProperty as any;

      const result = await resolver({}, { id: "123" }, ctx, {} as any);

      expect(repoMock.deletePropertyById).toHaveBeenCalledWith(
        ctx.prisma,
        "123"
      );
      expect(result).toBe(true);
    });

    it("rzuca NOT_FOUND gdy deletePropertyById zwróci false", async () => {
      const ctx = makeContext();

      repoMock.deletePropertyById.mockResolvedValue(false);

      const resolver = propertyResolvers.Mutation!.deleteProperty as any;

      await expect(
        resolver({}, { id: "X" }, ctx, {} as any)
      ).rejects.toMatchObject({
        message: "Property with id X not found",
        extensions: { code: "NOT_FOUND" },
      });
    });
  });
});
