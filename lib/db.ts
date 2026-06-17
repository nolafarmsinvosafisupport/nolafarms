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
