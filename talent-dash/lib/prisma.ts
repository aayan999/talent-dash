import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Buffer } from "node:buffer";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: resolvePostgresConnectionString(process.env.DATABASE_URL),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function resolvePostgresConnectionString(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(databaseUrl);

  if (url.protocol !== "prisma+postgres:") {
    return databaseUrl;
  }

  const apiKey = url.searchParams.get("api_key");
  if (!apiKey) {
    throw new Error("Prisma Postgres DATABASE_URL is missing api_key.");
  }

  const payload = JSON.parse(Buffer.from(apiKey, "base64url").toString("utf8")) as {
    databaseUrl?: string;
  };

  if (!payload.databaseUrl) {
    throw new Error("Prisma Postgres DATABASE_URL did not include a database URL.");
  }

  return payload.databaseUrl;
}
