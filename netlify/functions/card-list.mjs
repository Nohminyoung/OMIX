/* =====================================================
   OMIX — card-list (Netlify Function)
   GET /.netlify/functions/card-list
   응답 { "mediaBase": "<R2 공개 주소>", "cards": [{ "id", "createdAt", "hasCard" }, ...] }

   R2 의 cards/{id}/ 폴더를 훑어서 영상(play.mp4)이 올라온 카드만 최신순으로 돌려준다.
   my-player.js 의 'QR로 받은 트랙' 칸이 이 목록을 차트처럼 보여준다 (전체 공개).
   R2 공개 주소로는 목록을 볼 수 없어서 upload-url 과 같은 R2 키로 읽는다 — 키는 응답에 넣지 않는다.
   ===================================================== */
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const MAX_CARDS = 500;

const json = (status, body, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  });

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

/* id 앞부분(20261122_130020)이 촬영 시각 — 없으면 업로드 시각을 쓴다 */
function idTime(id) {
  const m = id.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00` : null;
}

export default async () => {
  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) return json(500, { error: 'server not configured', missing });

  const byId = new Map();
  let token;
  try {
    do {
      const out = await client().send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET, Prefix: 'cards/', ContinuationToken: token,
      }));
      for (const obj of out.Contents || []) {
        const [, id, name] = obj.Key.split('/');
        if (!id || !name) continue;
        const c = byId.get(id) || { id, hasCard: false, hasVideo: false, uploaded: 0 };
        if (name === 'card.jpg') c.hasCard = true;
        if (name === 'play.mp4') c.hasVideo = true;
        c.uploaded = Math.max(c.uploaded, new Date(obj.LastModified).getTime() || 0);
        byId.set(id, c);
      }
      token = out.IsTruncated ? out.NextContinuationToken : undefined;
    } while (token);
  } catch (e) {
    return json(502, { error: 'R2 list failed' });
  }

  const cards = [...byId.values()]
    .filter((c) => c.hasVideo)
    .map((c) => ({ id: c.id, hasCard: c.hasCard, createdAt: Date.parse(idTime(c.id)) || c.uploaded }))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_CARDS);

  const mediaBase = process.env.R2_PUBLIC_URL.replace(/\/+$/, '');
  /* 새 체험이 1분 안에 보이도록 짧게만 캐시 */
  return json(200, { mediaBase, cards }, 'public, max-age=60');
};
