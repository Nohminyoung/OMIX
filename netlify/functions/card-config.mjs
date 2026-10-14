/* =====================================================
   OMIX — card-config (Netlify Function)
   card.html 이 R2 공개 주소를 환경변수(R2_PUBLIC_URL)에서 읽어가도록 알려준다.
   공개 주소만 내보낸다 — 비밀키는 절대 여기 넣지 말 것.
   ===================================================== */
export default async () => {
  const mediaBase = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
  return new Response(JSON.stringify({ mediaBase }), {
    status: mediaBase ? 200 : 500,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
