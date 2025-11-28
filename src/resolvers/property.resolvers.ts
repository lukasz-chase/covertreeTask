import { Prisma, Property } from "@prisma/client";
import { GraphQLError } from "graphql";
import GraphQLJSON from "graphql-type-json";
import { DateTimeResolver } from "graphql-scalars";
import { prisma } from "../db/client";
import { WeatherstackClient } from "../services/weatherstack";
import {
  findProperties,
  findPropertyById,
  createProperty as createPropertyRecord,
  deletePropertyById,
  PropertyFilter,
  SortOrder,
} from "../repositories/property.repository";

export type GraphQLContext = {
  prisma: typeof prisma;
  weatherstackClient: WeatherstackClient;
};

type PropertyFilterInput = PropertyFilter;

export const propertyResolvers = {
  DateTime: DateTimeResolver,
  JSON: GraphQLJSON,

  Query: {
    properties: async (
      _: unknown,
      args: {
        filter?: PropertyFilterInput;
        sortBy?: "CREATED_AT";
        sortOrder?: SortOrder;
      },
      context: GraphQLContext
    ): Promise<Property[]> => {
      const { prisma: prismaClient } = context;
      const { filter, sortOrder = "DESC" } = args;

      return findProperties(prismaClient, { filter, sortOrder });
    },

    property: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ): Promise<Property | null> => {
      const { prisma: prismaClient } = context;
      const property = await findPropertyById(prismaClient, args.id);
      if (!property)
        throw notFoundError(`Property with id ${args.id} not found`);
      return property;
    },
  },

  Mutation: {
    createProperty: async (
      _: unknown,
      args: {
        input: {
          city: string;
          street: string;
          state: string;
          zipCode: string;
        };
      },
      context: GraphQLContext
    ): Promise<Property> => {
      const { prisma: prismaClient, weatherstackClient } = context;
      const { input } = args;
      const { city, state, zipCode, street } = input;
      const { getCurrentWeather, extractLatLong } = weatherstackClient;

      const weather = await getCurrentWeather({
        city,
        state,
        zipCode,
      });

      const { lat, long } = extractLatLong(weather.location);

      const weatherData = weather.current as Prisma.InputJsonValue;

      const property = await createPropertyRecord(prismaClient, {
        city,
        street,
        state,
        zipCode,
        lat,
        long,
        weatherData,
      });

      if (!property) {
        throw new GraphQLError("Property already exists", {
          extensions: { code: "ALREADY_EXISTS" },
        });
      }

      return property;
    },

    deleteProperty: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { prisma: prismaClient } = context;
      const isDeleted = await deletePropertyById(prismaClient, args.id);
      if (!isDeleted)
        throw notFoundError(`Property with id ${args.id} not found`);
      return isDeleted;
    },
  },
};

const notFoundError = (message: string) => {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
};
