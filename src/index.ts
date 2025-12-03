import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { prisma } from "./db/client";
import { env } from "./config/env";
import { createWeatherstackClient } from "./services/weatherstack";
import { GraphQLContext } from "./resolvers/property.resolvers";

const weatherstackClient = createWeatherstackClient(env.weatherstackApiKey);

const createContext = async (): Promise<GraphQLContext> => ({
  prisma,
  weatherstackClient,
});

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => createContext(),
});

console.log(`🚀 Server listening at: ${url}`);
