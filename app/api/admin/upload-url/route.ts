import { requireAdminResponse, parseJsonBody } from '@/lib/api-utils';
import { isR2Configured, buildImageKey, getUploadUrl } from '@/lib/r2';

const MAX_FILENAME_LENGTH = 200;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(request: Request) {
  const deny = await requireAdminResponse();
  if (deny) return deny;

  if (!isR2Configured()) {
    return Response.json(
      { success: false, message: 'Image uploads require R2 to be configured in Railway. Use the manual path field below for now.' },
      { status: 503 },
    );
  }

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const { filename, contentType } = (body ?? {}) as { filename?: string; contentType?: string };
  if (!filename || typeof filename !== 'string' || filename.length > MAX_FILENAME_LENGTH) {
    return Response.json({ success: false, message: 'A valid filename is required.' }, { status: 400 });
  }
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return Response.json({ success: false, message: 'Only JPEG, PNG, WebP, GIF, or AVIF images are supported.' }, { status: 400 });
  }

  const key = buildImageKey(filename);
  const { uploadUrl, publicUrl } = await getUploadUrl(key, contentType);
  return Response.json({ success: true, uploadUrl, publicUrl });
}
