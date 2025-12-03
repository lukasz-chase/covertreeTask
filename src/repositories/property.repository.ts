import { Prisma, PrismaClient, Property } from "@prisma/client";

export type PropertyFilter = {
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
};

export type SortOrder = "ASC" | "DESC";

export type CreatePropertyData = {
  city: string;
  street: string;
  state: string;
  zipCode: string;
  lat: number;
  long: number;
  weatherData: Prisma.InputJsonValue;
};

/**
 * Builds a Prisma `where` clause from a property filter object.
 * @param filter - The filter object containing criteria like city, state, or zipCode.
 * @returns A `Prisma.PropertyWhereInput` object for use in Prisma queries.
 */
const buildWhereClause = (
  filter?: PropertyFilter
): Prisma.PropertyWhereInput => {
  if (!filter) {
    return {};
  }

  const where: Prisma.PropertyWhereInput = {};

  if (filter.city) {
    where.city = filter.city;
  }
  if (filter.state) {
    where.state = filter.state;
  }
  if (filter.zipCode) {
    where.zipCode = filter.zipCode;
  }

  return where;
};

/**
 * Maps the custom `SortOrder` type to Prisma's `Prisma.SortOrder` type.
 * @param sortOrder - The sort order to map ('ASC' or 'DESC').
 * @returns The corresponding Prisma sort order ('asc' or 'desc').
 */
const mapSortOrder = (sortOrder: SortOrder): Prisma.SortOrder => {
  return sortOrder === "ASC" ? "asc" : "desc";
};

/**
 * Finds and returns a list of properties based on specified filters and sorting.
 * @param prisma - The PrismaClient instance.
 * @param args - An object containing optional filter and sortOrder.
 * @returns A promise that resolves to an array of `Property` objects.
 */
export const findProperties = async (
  prisma: PrismaClient,
  args: {
    filter?: PropertyFilter;
    sortOrder?: SortOrder;
  }
): Promise<Property[]> => {
  const { filter, sortOrder = "DESC" } = args;
  const where = buildWhereClause(filter);

  return prisma.property.findMany({
    where,
    orderBy: {
      createdAt: mapSortOrder(sortOrder),
    },
  });
};

/**
 * Finds a single property by its unique ID.
 * @param prisma - The PrismaClient instance.
 * @param id - The unique identifier of the property.
 * @returns A promise that resolves to the `Property` object or `null` if not found.
 */
export const findPropertyById = async (
  prisma: PrismaClient,
  id: string
): Promise<Property | null> => {
  return prisma.property.findUnique({
    where: { id },
  });
};

/**
 * Creates a new property in the database.
 * Handles unique constraint violations by returning null.
 * @param prisma - The PrismaClient instance.
 * @param data - The data for the new property.
 * @returns A promise that resolves to the created `Property` object, or `null` if a property with the same address already exists.
 */
export const createProperty = async (
  prisma: PrismaClient,
  data: CreatePropertyData
): Promise<Property | null> => {
  try {
    const property = await prisma.property.create({
      data,
    });
    return property;
  } catch (error: any) {
    const e = error as Prisma.PrismaClientKnownRequestError;

    // Same entry already in database (street+city+state+zipCode)
    if (e.code === "P2002") {
      return null;
    }

    throw error;
  }
};

/**
 * Deletes a property from the database by its unique ID.
 * @param prisma - The PrismaClient instance.
 * @param id - The unique identifier of the property to delete.
 * @returns A promise that resolves to `true` if the deletion was successful,
 * or `false` if the property was not found.
 */
export const deletePropertyById = async (
  prisma: PrismaClient,
  id: string
): Promise<boolean> => {
  try {
    await prisma.property.delete({
      where: { id },
    });
    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      // Not found
      return false;
    }
    throw error;
  }
};
