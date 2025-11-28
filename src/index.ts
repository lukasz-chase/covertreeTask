import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { prisma } from "./db/client";
import { env } from "./config/env";
import { createWeatherstackClient } from "./services/weatherstack";
import { GraphQLContext } from "./resolvers/property.resolvers";

const weatherstackClient = createWeatherstackClient(env.weatherstackApiKey);

const createContext = (): GraphQLContext => ({
  prisma,
  weatherstackClient,
});

const startServer = async (): Promise<void> => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
  });

  const { url } = await server.listen({ port: env.port });
  console.log(`Server ready at ${url}`);
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
