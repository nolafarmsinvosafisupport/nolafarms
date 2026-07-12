# Database Backups & Restore

Railway's managed backups are a paid feature. This project instead takes its own nightly
logical backup with `pg_dump` and stores it in a **private** Cloudflare R2 bucket.

| | |
|---|---|
| **What runs it** | `.github/workflows/db-backup.yml` (GitHub Actions) |
| **When** | Daily, 01:00 UTC (04:00 EAT). Also runnable on demand via **Run workflow**. |
| **Where it lands** | `s3://nolaranches-backups/daily/nolaranches-YYYY-MM-DD.dump` |
| **Retention** | Daily copies for 30 days. A copy from the 1st of each month is kept in `monthly/` and never pruned. |
| **Format** | `pg_dump --format=custom` (compressed; restore with `pg_restore`) |
| **If it fails** | GitHub emails the repo owner on a failed workflow run. |

## Why a separate bucket

Product images live in `nolaranches-products`, which is served publicly on
`images.nolaranches.co.ke`. **Backups must never go in that bucket** — a dump there would be a
publicly downloadable copy of every customer name, phone number, email, and order.
`nolaranches-backups` is private, has no custom domain, and uses its own API token that cannot
read or write the images bucket (and vice versa).

## Restoring

The dumps are plain `pg_restore` archives — nothing about the process is Railway-specific.

### 1. Download the backup you want

```bash
export AWS_ACCESS_KEY_ID=<R2_BACKUP_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<R2_BACKUP_SECRET_ACCESS_KEY>
export AWS_DEFAULT_REGION=auto
export ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com

# See what's available
aws s3 ls s3://nolaranches-backups/daily/ --endpoint-url "$ENDPOINT"

# Pull one down
aws s3 cp s3://nolaranches-backups/daily/nolaranches-2026-07-12.dump . --endpoint-url "$ENDPOINT"
```

### 2. Inspect it before you touch anything

```bash
pg_restore --list nolaranches-2026-07-12.dump
```

### 3. Rehearse into a scratch database first

Never let a production outage be the first time you run the restore command.

```bash
createdb nola_restore_test
pg_restore --no-owner --no-privileges --dbname nola_restore_test nolaranches-2026-07-12.dump
psql nola_restore_test -c "SELECT count(*) FROM products;"
```

### 4. Restore into production

**Destructive** — `--clean --if-exists` drops and recreates the objects in the dump.

```bash
# DATABASE_PUBLIC_URL comes from Railway → Postgres service → Variables
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$DATABASE_PUBLIC_URL" nolaranches-2026-07-12.dump
```

The app's schema is also idempotently re-created at runtime by `lib/db-migrate.ts`
(`ensureMigrated()`), so a restore into an empty database works even if the schema is missing —
the data is the part that only the backup can give you back.

### Client version

Railway runs **Postgres 18**. `pg_dump`/`pg_restore` refuse to work against a server newer than
themselves, so use an 18.x client. The workflow installs `postgresql-client-18` from the PGDG apt
repo for exactly this reason.

## Required GitHub repository secrets

Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `DATABASE_PUBLIC_URL` | Railway → Postgres → Variables → `DATABASE_PUBLIC_URL` (the **public** proxy URL — the runner can't reach `railway.internal`) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_BACKUP_BUCKET` | `nolaranches-backups` |
| `R2_BACKUP_ACCESS_KEY_ID` | From the R2 API token scoped to the backups bucket |
| `R2_BACKUP_SECRET_ACCESS_KEY` | Same token's secret |

## Known limits

- The backup is **logical, not point-in-time**. Worst case you lose up to 24 hours of writes
  (whatever happened since the last 01:00 UTC run). At current volume that is an acceptable
  trade; if order volume grows, move to a paid plan with PITR.
- Restores are manual. There is no automated failover.
