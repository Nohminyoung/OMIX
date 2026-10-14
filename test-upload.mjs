/* =====================================================
   OMIX — test-upload.mjs (전시 PC 업로드 흐름 테스트)
   사용법 (PowerShell):
     $env:OMIX_UPLOAD_KEY = "키"
     node test-upload.mjs https://사이트주소 카드.jpg 영상.mp4
   → upload-url 로 주소 발급 → R2 에 PUT → 카드 페이지 링크 출력
   전시 PC 프로그램도 이 순서 그대로 하면 된다.
   ===================================================== */
import { readFile } from 'node:fs/promises';

const [site, jpgPath, mp4Path] = process.argv.slice(2);
const key = process.env.OMIX_UPLOAD_KEY;
if (!site || !jpgPath || !mp4Path || !key) {
  console.error('사용법: $env:OMIX_UPLOAD_KEY="키"; node test-upload.mjs <사이트주소> <card.jpg> <play.mp4>');
  process.exit(1);
}

/* 전시 PC와 같은 형식의 id: 20261120_143205_ab12 */
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const id = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
           `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_` +
           Math.random().toString(36).slice(2, 6);

const res = await fetch(`${site.replace(/\/$/, '')}/.netlify/functions/upload-url`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-omix-key': key },
  body: JSON.stringify({ id, files: ['card.jpg', 'play.mp4'] }),
});
const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`✖ 주소 발급 실패 (${res.status})`, data);
  process.exit(1);
}
console.log(`✔ 주소 발급 — id: ${id}`);
console.log(`  카드 페이지: ${data.page}`);

const uploads = [
  ['card.jpg', jpgPath, 'image/jpeg'],
  ['play.mp4', mp4Path, 'video/mp4'],
];
for (const [name, path, type] of uploads) {
  const body = await readFile(path);
  const t = Date.now();
  const put = await fetch(data.urls[name], { method: 'PUT', headers: { 'content-type': type }, body });
  if (!put.ok) {
    console.error(`✖ ${name} 업로드 실패 (${put.status})`, await put.text());
    process.exit(1);
  }
  console.log(`✔ ${name} 업로드 (${(body.length / 1024 / 1024).toFixed(1)}MB, ${((Date.now() - t) / 1000).toFixed(1)}초)`);
}

console.log(`\n폰으로 열어보기 → ${data.page}`);
