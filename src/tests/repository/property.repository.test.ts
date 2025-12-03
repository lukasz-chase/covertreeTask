import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  findProperties,
  findPropertyById,
  createProperty,
  deletePropertyById,
} from "../../repositories/property.repository";
import { PropertyEntity } from "../../db/types";
import { mockPrisma, prismaErrorMock } from "../helpers/mockContext";

describe("Property Repository", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("findProperties", () => {
    it("calls Prisma with correct filter + sort", async () => {
      const fake: PropertyEntity = {
        id: "1",
        city: "NY",
        street: "123",
        state: "NY",
        zipCode: "10001",
        lat: 10,
        long: 20,
        weatherData: { temp: 20 },
        createdAt: new Date(),
      };

      mockPrisma.property.findMany.mockResolvedValue([fake]);

      const result = await findProperties(mockPrisma, {
        filter: { city: "NY" },
        sortOrder: "ASC",
      });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: { city: "NY" },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(result[0].city).toBe("NY");
    });

    it("returns all properties if no filter is provided", async () => {
      const fake = {
        id: "1",
        city: "NY",
      };
      mockPrisma.property.findMany.mockResolvedValue([
        fake,
        { ...fake, id: 2 },
      ]);

      const properties = await findProperties(mockPrisma, {});

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });

      expect(properties.length).toBe(2);
    });
  });

  describe("findPropertyById", () => {
    it("returns property by id", async () => {
      const fake = { id: "5" };
      mockPrisma.property.findUnique.mockResolvedValue(fake);

      const result = await findPropertyById(mockPrisma, "5");

      expect(mockPrisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: "5" },
      });

      expect(result).toEqual(fake);
    });

    it("returns null when not found", async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      const result = await findPropertyById(mockPrisma, "bad");

      expect(result).toBeNull();
    });
  });

  describe("createProperty", () => {
    it("creates property successfully", async () => {
      const input = {
        city: "Austin",
        street: "5th",
        state: "TX",
        zipCode: "73301",
        lat: 10,
        long: 20,
        weatherData: { temp: 30 },
      };

      const created = {
        id: "ABC",
        createdAt: new Date(),
        ...input,
      };

      mockPrisma.property.create.mockResolvedValue(created);

      const result = await createProperty(mockPrisma, input);

      expect(mockPrisma.property.create).toHaveBeenCalledWith({
        data: input,
      });

      expect(result?.id).toBe("ABC");
    });

    it("returns null when unique constraint is violated (P2002)", async () => {
      mockPrisma.property.create.mockRejectedValue({ code: "P2002" });

      const input = {
        city: "Austin",
        street: "5th",
        state: "TX",
        zipCode: "73301",
        lat: 10,
        long: 20,
        weatherData: { temp: 30 },
      };

      const result = await createProperty(mockPrisma, input);

      expect(result).toBeNull();
    });

    it("rethrows unexpected errors", async () => {
      const mockPrismaError = prismaErrorMock("OTHER");

      mockPrisma.property.create.mockRejectedValue(mockPrismaError);
    });
  });

  describe("deletePropertyById", () => {
    it("returns true when deletion succeeds", async () => {
      mockPrisma.property.delete.mockResolvedValue(true);

      const result = await deletePropertyById(mockPrisma, "123");

      expect(mockPrisma.property.delete).toHaveBeenCalledWith({
        where: { id: "123" },
      });

      expect(result).toBe(true);
    });

    it("returns false when record does not exist (P2025)", async () => {
      mockPrisma.property.delete.mockRejectedValue({ code: "P2025" });

      const result = await deletePropertyById(mockPrisma, "X");

      expect(result).toBe(false);
    });

    it("rethrows other prisma errors", async () => {
      const mockPrismaError = prismaErrorMock("OTHER");
      mockPrisma.property.delete.mockRejectedValue(mockPrismaError);

      await expect(deletePropertyById(mockPrisma, "X")).rejects.toThrow();
    });
  });
});
