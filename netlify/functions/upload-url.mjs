/* =====================================================
   OMIX — upload-url (Netlify Function)
   전시 PC → POST /.netlify/functions/upload-url
     헤더  x-omix-key: {OMIX_UPLOAD_KEY}
     본문  { "id": "20261120_143205_ab12", "files": ["card.jpg", "play.mp4"] }
   응답   { "urls": { "card.jpg": "<presigned PUT>", ... }, "page": "https://사이트/card?id=..." }

   전시 PC는 받은 주소로 PUT 할 때 Content-Type 헤더를 꼭 같이 보내야 한다
   (jpg → image/jpeg, mp4 → video/mp4). 서명에 포함돼 있어서 다르면 403.
   ===================================================== */
import { createHash, timingSafeEqual } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const EXPIRES_SEC = 60 * 60; // 1시간
const CONTENT_TYPES = { jpg: 'image/jpeg', mp4: 'video/mp4' };
const ID_RE = /^[\w-]{1,64}$/;
const FILE_RE = /^[\w-]{1,64}\.(jpg|mp4)$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/* 길이가 달라도 시간 차이로 키가 새지 않게 해시끼리 비교 */
function sameKey(a, b) {
  const h = (s) => createHash('sha256').update(String(s)).digest();
  return timingSafeEqual(h(a), h(b));
}

let s3;
function client() {
  if (!s3) {
    s3 = new S3Client({
      region: 'auto',
      forcePathStyle: true,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'OMIX_UPLOAD_KEY'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) return json(500, { error: 'server not configured', missing });

  if (!sameKey(req.headers.get('x-omix-key') || '', process.env.OMIX_UPLOAD_KEY)) {
    return json(401, { error: 'unauthorized' });
  }

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'invalid JSON' }); }

  const { id, files } = body || {};
  if (typeof id !== 'string' || !ID_RE.test(id)) return json(400, { error: 'invalid id' });
  if (!Array.isArray(files) || files.length === 0 || files.length > 5) return json(400, { error: 'files must be 1-5 names' });
  const bad = files.filter((f) => typeof f !== 'string' || !FILE_RE.test(f));
  if (bad.length) return json(400, { error: 'invalid file name (jpg/mp4 only)', bad });

  const urls = {};
  for (const name of files) {
    const ext = name.split('.').pop();
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `cards/${id}/${name}`,
      ContentType: CONTENT_TYPES[ext],
    });
    /* content-type 을 서명에 넣어서 다른 형식으로 올리면 R2 가 거절하게 한다 */
    urls[name] = await getSignedUrl(client(), cmd, {
      expiresIn: EXPIRES_SEC,
      signableHeaders: new Set(['content-type']),
    });
  }

  /* 사이트 주소: 넷리파이가 넣어주는 URL(대표 도메인), 없으면 요청 주소 */
  const site = process.env.URL || new URL(req.url).origin;
  return json(200, { urls, page: `${site}/card?id=${encodeURIComponent(id)}` });
};
