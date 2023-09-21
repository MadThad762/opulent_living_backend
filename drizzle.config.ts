import type { Config } from 'drizzle-kit';

/** @type { import("drizzle-kit").Config } */
export default {
  schema: './.drizzle',
  out: './.drizzle',
  driver: 'mysql2',
  dbCredentials: {
    connectionString: String(process.env.DATABASE_URL),
  },
} satisfies Config;
