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

const mapSortOrder = (sortOrder: SortOrder): Prisma.SortOrder => {
  return sortOrder === "ASC" ? "asc" : "desc";
};

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

export const findPropertyById = async (
  prisma: PrismaClient,
  id: string
): Promise<Property | null> => {
  return prisma.property.findUnique({
    where: { id },
  });
};

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
