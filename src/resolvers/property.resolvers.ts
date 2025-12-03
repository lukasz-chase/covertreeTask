import { Prisma } from "@prisma/client";
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
} from "../repositories/property.repository";
import { Resolvers } from "../generated/schema";

export type GraphQLContext = {
  prisma: typeof prisma;
  weatherstackClient: WeatherstackClient;
};

/**
 * A map of resolver functions for the Property-related parts of the GraphQL schema.
 */
export const propertyResolvers: Resolvers = {
  DateTime: DateTimeResolver,
  JSON: GraphQLJSON,

  Query: {
    /**
     * Fetches a list of properties, with optional filtering and sorting.
     * @param _ - The parent object, not used in this resolver.
     * @param args - The arguments for filtering and sorting the properties.
     * @param context - The GraphQL context containing the Prisma client.
     * @returns A promise that resolves to an array of properties.
     */
    properties: async (_, args, context) => {
      const { prisma: prismaClient } = context;
      const { filter: inputFilter, sortOrder = "DESC" } = args;

      const dbFilter = inputFilter
        ? {
            city: inputFilter.city ?? undefined,
            state: inputFilter.state ?? undefined,
            zipCode: inputFilter.zipCode ?? undefined,
          }
        : undefined;

      return findProperties(prismaClient, {
        filter: dbFilter,
        sortOrder,
      });
    },

    /**
     * Fetches a single property by its unique ID.
     * @param _ - The parent object, not used in this resolver.
     * @param args - The arguments containing the ID of the property to fetch.
     * @param context - The GraphQL context containing the Prisma client.
     * @returns A promise that resolves to the found property.
     * @throws {GraphQLError} If no property with the given ID is found.
     */
    property: async (_, args, context) => {
      const { prisma: prismaClient } = context;
      const property = await findPropertyById(prismaClient, args.id);
      if (!property)
        throw notFoundError(`Property with id ${args.id} not found`);
      return property;
    },
  },

  Mutation: {
    /**
     * Creates a new property. It fetches weather data for the property's location
     * and then saves the new property to the database.
     * @param _ - The parent object, not used in this resolver.
     * @param args - The arguments containing the input data for the new property.
     * @param context - The GraphQL context containing the Prisma and Weatherstack clients.
     * @returns A promise that resolves to the newly created property.
     * @throws {GraphQLError} If a property with the same address already exists.
     */
    createProperty: async (_, args, context) => {
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

      const data = {
        city,
        street,
        state,
        zipCode,
        lat,
        long,
        weatherData,
      };

      const property = await createPropertyRecord(prismaClient, data);

      if (!property) {
        throw new GraphQLError("Property already exists", {
          extensions: { code: "ALREADY_EXISTS" },
        });
      }

      return property;
    },

    /**
     * Deletes a property by its unique ID.
     * @param _ - The parent object, not used in this resolver.
     * @param args - The arguments containing the ID of the property to delete.
     * @param context - The GraphQL context containing the Prisma client.
     * @returns A promise that resolves to `true` if the deletion was successful.
     * @throws {GraphQLError} If no property with the given ID is found to be deleted.
     */
    deleteProperty: async (_, args, context) => {
      const { prisma: prismaClient } = context;
      const isDeleted = await deletePropertyById(prismaClient, args.id);
      if (!isDeleted)
        throw notFoundError(`Property with id ${args.id} not found`);
      return isDeleted;
    },
  },
};

/**
 * A helper function to create a standardized `GraphQLError` for "NOT_FOUND" errors.
 * @param message - The error message to display.
 * @returns A `GraphQLError` object with a "NOT_FOUND" error code.
 */
const notFoundError = (message: string) => {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
};
