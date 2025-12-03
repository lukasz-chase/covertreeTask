# Covertree Task: Backend Application

This document outlines the setup instructions and API usage for the backend application.

## 1. Setup & Running the App

Follow these steps to get the application running locally.

### 1.1. Install Dependencies

```sh
npm install
```

### 1.2. Environment Variables

Create a `.env` file in the project root with the following content.

```
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
WEATHERSTACK_API_KEY=your_weatherstack_api_key_here
```

### 1.3. Prisma: Generate Client & Run Migrations

```sh
npx prisma generate
npx prisma migrate dev --name init
```

### 1.4. Run the Server (Development)

```sh
npm run dev
```

If everything is configured correctly, you should see the following output in your terminal:
`Server ready at http://localhost:4000/`

You can now open <http://localhost:4000/> in your browser. Apollo Sandbox will appear, which is where you can run the GraphQL queries and mutations described below.

## 2. API Usage & User Stories

Below are the 6 user stories and the corresponding GraphQL operations to test them.

### 2.1. Story 1: Query All Properties

Returns an array of all properties in the database. The default sort order is by `createdAt` descending (newest first).

```graphql
query GetAllProperties {
  properties {
    id
    city
    street
    state
    zipCode
    lat
    long
    createdAt
  }
}
```

### 2.2. Story 2: Sort Properties by Creation Date

Returns an array of properties sorted by `createdAt` descending.

```graphql
query GetPropertiesSortedDesc {
  properties(sortOrder: DESC) {
    id
    city
    createdAt
  }
}
```

### 2.3. Story 3: Filter by City, State, and Zip Code

**Filter by State:**

```graphql
query GetPropertiesInWA {
  properties(filter: { state: "WA" }) {
    id
    city
    street
    state
    zipCode
  }
}
```

**Filter by City:**

```graphql
query GetPropertiesInAuburn {
  properties(filter: { city: "Auburn" }) {
    id
    city
    street
    state
    zipCode
  }
}
```

**Filter by Zip Code:**

```graphql
query GetPropertiesByZip {
  properties(filter: { zipCode: "98001" }) {
    id
    city
    street
    state
    zipCode
  }
}
```

### 2.4. Story 4: Query Details of Any Property

Replace `PROPERTY_ID` with the actual ID of a property.

```graphql
query GetPropertyDetails {
  property(id: "PROPERTY_ID") {
    id
    city
    street
    state
    zipCode
    lat
    long
    weatherData
    createdAt
  }
}
```

### 2.5. Story 5: Add a New Property

```graphql
mutation CreateProperty {
  createProperty(
    input: { city: "Cheyenne", street: "6020 Yellowstone Road", state: "WY", zipCode: "82009" }
  ) {
    id
    city
    street
    state
    zipCode
    lat
    long
    weatherData
    createdAt
  }
}
```

### 2.6. Story 6: Delete Any Property

Replace `PROPERTY_ID` with the actual ID of a property you want to delete.

```graphql
mutation DeleteProperty {
  deleteProperty(id: "PROPERTY_ID")
}
```
