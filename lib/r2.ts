import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 is S3-API-compatible, so the standard AWS SDK talks to it directly —
// just point the endpoint at the Cloudflare account's R2 gateway instead of AWS.
let _client: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL,
  );
}

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

// Keeps uploaded filenames readable in the R2 dashboard while guaranteeing no
// collisions between two admins uploading a file with the same original name.
export function buildImageKey(originalFilename: string): string {
  const safeName = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';
  return `products/${randomUUID()}-${safeName}`;
}

// Presigned PUT URL — the browser uploads the file bytes directly to R2, the
// Next.js/Railway server never touches them. 5-minute expiry is generous for
// a single-file upload but short enough that a leaked URL is useless shortly after.
export async function getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL!.replace(/\/$/, '')}/${key}`;
  return { uploadUrl, publicUrl };
}
