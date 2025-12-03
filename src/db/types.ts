import { Prisma } from "@prisma/client";

export type CreatePropertyData = {
  city: string;
  street: string;
  state: string;
  zipCode: string;
  lat: number;
  long: number;
  weatherData: Prisma.InputJsonValue;
};

export type PropertyEntity = {
  id: string;
  city: string;
  street: string;
  state: string;
  zipCode: string;
  lat: number;
  long: number;
  weatherData: Prisma.JsonValue;
  createdAt: Date;
};
export type PropertyFilter = {
  city?: string;
  state?: string;
  zipCode?: string;
};

export type SortOrder = "ASC" | "DESC";
