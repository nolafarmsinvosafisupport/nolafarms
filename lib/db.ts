import postgres from 'postgres';

let _sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }
  if (!_sql) {
    const isInternal = process.env.DATABASE_URL.includes('railway.internal');
    _sql = postgres(process.env.DATABASE_URL, {
      ssl: isInternal ? false : 'prefer',
      max: 10,
      idle_timeout: 20,
      // postgres.js v3 parses all date/time OIDs as Date objects by default.
      // Returning strings keeps Booking types accurate and avoids React
      // "Objects are not valid as a React child" crashes when dates are rendered.
      types: {
        date: {
          to: 1184,
          from: [1082, 1083, 1114, 1184, 1266],
          serialize: (x: unknown) => x instanceof Date ? x.toISOString() : String(x),
          parse: (x: string) => x,
        },
      },
    });
  }
  return _sql;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function dbNotConfiguredResponse(feature: string) {
  return Response.json(
    { success: false, message: `${feature} requires DATABASE_URL to be configured.` },
    { status: 503 },
  );
}
