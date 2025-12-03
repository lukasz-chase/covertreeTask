export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  enum SortOrder {
    ASC
    DESC
  }

  enum PropertySortBy {
    CREATED_AT
  }

  type Property {
    id: ID!
    city: String!
    street: String!
    state: String!
    zipCode: String!
    weatherData: JSON!
    lat: Float!
    long: Float!
    createdAt: DateTime!
  }

  input PropertyFilterInput {
    city: String
    state: String
    zipCode: String
  }

  input CreatePropertyInput {
    city: String!
    street: String!
    state: String!
    zipCode: String!
  }

  type Query {
    properties(
      filter: PropertyFilterInput
      sortBy: PropertySortBy = CREATED_AT
      sortOrder: SortOrder = DESC
    ): [Property!]!

    property(id: ID!): Property
  }

  type Mutation {
    createProperty(input: CreatePropertyInput!): Property!
    deleteProperty(id: ID!): Boolean!
  }
`;
