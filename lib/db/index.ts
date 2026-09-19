import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

/**
 * PostgreSQL connection client.
 * Null-safe when DATABASE_URL is not yet provided in the environment.
 */
export const pgClient = connectionString
  ? postgres(connectionString, { prepare: false })
  : null;

export const db = pgClient ? drizzle(pgClient, { schema }) : null;

export type Database = typeof db;

export const isDbAvailable = Boolean(db);
