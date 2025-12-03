import { PrismaClient } from "@prisma/client";
import propertyResolvers from "../repository/property.repository.test";
import { describe, test, expect, beforeEach, jest, it } from "@jest/globals";

const prismaMock = {
  property: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

describe("property.repository", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("findProperties", () => {
    it("calls prisma.property.findMany with built where + orderBy", async () => {
      const fakeResult = [
        {
          id: "1",
          city: "NY",
          state: "NY",
          zipCode: "10001",
          createdAt: new Date(),
        },
      ];

      (prismaMock.property.findMany as jest.Mock).mockResolvedValue(fakeResult);

      const result = await propertyResolvers.findProperties(prismaMock, {
        filter: { city: "NY", state: "NY" },
        sortOrder: "ASC",
      });

      expect(prismaMock.property.findMany).toHaveBeenCalledWith({
        where: {
          city: "NY",
          state: "NY",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(result).toEqual(fakeResult);
    });

    it("uses default sortOrder DESC when not provided", async () => {
      (prismaMock.property.findMany as jest.Mock).mockResolvedValue([]);

      await propertyResolvers.findProperties(prismaMock, {});

      expect(prismaMock.property.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          createdAt: "desc",
        },
      });
    });
  });

  describe("findPropertyById", () => {
    it("returns property when found", async () => {
      const fakeProperty = { id: "1" } as any;
      (prismaMock.property.findUnique as jest.Mock).mockResolvedValue(
        fakeProperty
      );

      const result = await propertyResolvers.findPropertyById(prismaMock, "1");

      expect(prismaMock.property.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toBe(fakeProperty);
    });
  });

  describe("createProperty", () => {
    it("returns property when created", async () => {
      const fakeData = { city: "NY" } as any;
      const fakeProperty = { id: "1", ...fakeData };
      (prismaMock.property.create as jest.Mock).mockResolvedValue(fakeProperty);

      const result = await propertyResolvers.createProperty(
        prismaMock,
        fakeData
      );

      expect(prismaMock.property.create).toHaveBeenCalledWith({
        data: fakeData,
      });
      expect(result).toBe(fakeProperty);
    });

    it("returns null on unique constraint violation (P2002)", async () => {
      const error = {
        code: "P2002",
      };
      (prismaMock.property.create as jest.Mock).mockRejectedValue(error);

      const result = await propertyResolvers.createProperty(
        prismaMock,
        {} as any
      );
      expect(result).toBeNull();
    });

    it("rethrows non P2002 errors", async () => {
      const error = { code: "SOME_OTHER_CODE" };
      (prismaMock.property.create as jest.Mock).mockRejectedValue(error);

      await expect(
        propertyResolvers.createProperty(prismaMock, {} as any)
      ).rejects.toBe(error);
    });
  });

  describe("deletePropertyById", () => {
    it("returns true if delete succeeds", async () => {
      (prismaMock.property.delete as jest.Mock).mockResolvedValue({});

      const result = await propertyResolvers.deletePropertyById(
        prismaMock,
        "1"
      );

      expect(prismaMock.property.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toBe(true);
    });

    it("returns false when prisma throws P2025", async () => {
      const error = { code: "P2025" };
      (prismaMock.property.delete as jest.Mock).mockRejectedValue(error);

      const result = await deletePropertyById(prismaMock, "not-existing");

      expect(result).toBe(false);
    });

    it("rethrows non P2025 errors", async () => {
      const error = { code: "OTHER" };
      (prismaMock.property.delete as jest.Mock).mockRejectedValue(error);

      await expect(deletePropertyById(prismaMock, "1")).rejects.toBe(error);
    });
  });
});
