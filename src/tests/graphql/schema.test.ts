import { describe, it, expect } from "@jest/globals";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { printSchema } from "graphql";

import { typeDefs } from "../../schema";
import { propertyResolvers } from "../../resolvers/property.resolvers";

describe("GraphQL Schema", () => {
  it("matches the printed snapshot", () => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: propertyResolvers,
    });

    expect(printSchema(schema)).toMatchSnapshot();
  });
});
