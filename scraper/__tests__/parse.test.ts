/**
 * Scraper ayrıştırma ve eşleştirme testleri.
 *
 * Bulut ortamından operatör sitelerine erişilemediği için gerçek sayfa
 * yapıları ÖRNEK HTML'lerle temsil edilir. Bu testler ayrıştırma mantığının
 * doğruluğunu ve — daha önemlisi — belirsizlikte GÜVENLİ DAVRANDIĞINI
 * doğrular.
 *
 * Çalıştır: npm run test:scraper
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractByProximity, extractFromJsonLd, extractPackages } from "../parse";
import { matchAndPlan, sanityCheck, type DbRow } from "../match";

// ─── Ayrıştırma ───────────────────────────────────────────────────────────────

test("yakınlık taraması: hız ve fiyatı aynı karttan çıkarır", () => {
  const html = `
    <div class="pkg"><h3>Fiber 100 Mbps</h3><span class="price">699 TL</span></div>
    <div class="pkg"><h3>Fiber 250 Mbps</h3><span class="price">849 TL</span></div>
    <div class="pkg"><h3>Fiber 500 Mbps</h3><span class="price">1099 ₺</span></div>`;

  const out = extractByProximity(html);
  assert.deepEqual(
    out.map((o) => [o.speed, o.price]),
    [[100, 699], [250, 849], [500, 1099]]
  );
});

test("sayfaya kampanya kutusu eklenince fiyatlar KAYMAZ", () => {
  // Eski konum bazlı mantığı bozan senaryo: başa alakasız bir fiyat girer.
  const html = `
    <div class="banner">Kampanya: ilk ay 249 TL</div>
    <div class="pkg"><h3>Fiber 100 Mbps</h3><span>699 TL</span></div>
    <div class="pkg"><h3>Fiber 250 Mbps</h3><span>849 TL</span></div>`;

  const out = extractPackages(html);
  const map = new Map(out.map((o) => [o.speed, o.price]));
  assert.equal(map.get(100), 699, "100 Mbps hâlâ 699 olmalı");
  assert.equal(map.get(250), 849, "250 Mbps hâlâ 849 olmalı");
});

test("JSON-LD varsa tercih edilir", () => {
  const html = `<script type="application/ld+json">
    {"@type":"Product","name":"Fiber 250 Mbps","offers":{"@type":"Offer","price":"879"}}
  </script>
  <div><h3>Fiber 250 Mbps</h3><span>9999 TL</span></div>`;

  const out = extractPackages(html);
  assert.equal(out.length, 1);
  assert.deepEqual([out[0].speed, out[0].price], [250, 879]);
});

test("aynı hız için çelişkili fiyat varsa kayıt atılır", () => {
  const html = `
    <div><h3>Fiber 100 Mbps</h3><span>699 TL</span></div>
    <div><h3>Fiber 100 Mbps</h3><span>799 TL</span></div>`;
  assert.equal(extractByProximity(html).length, 0);
});

test("mantıksız değerler elenir", () => {
  const html = `
    <div><h3>Fiber 100 Mbps</h3><span>12 TL</span></div>
    <div><h3>Fiber 250 Mbps</h3><span>99999 TL</span></div>`;
  assert.equal(extractByProximity(html).length, 0);
});

test("boş / alakasız sayfadan kayıt çıkmaz", () => {
  assert.equal(extractPackages("<html><body><p>Bakımdayız</p></body></html>").length, 0);
  assert.equal(extractPackages("").length, 0);
});

test("bozuk JSON-LD çökmeye yol açmaz", () => {
  const html = `<script type="application/ld+json">{bozuk json</script>
    <div><h3>Fiber 100 Mbps</h3><span>699 TL</span></div>`;
  assert.equal(extractPackages(html)[0].price, 699);
});

// ─── Eşleştirme ───────────────────────────────────────────────────────────────

const rows: DbRow[] = [
  { id: 1, downloadSpeed: 100, priceMonthly: 699, name: "Fiber 100" },
  { id: 2, downloadSpeed: 250, priceMonthly: 849, name: "Fiber 250" },
  { id: 3, downloadSpeed: 500, priceMonthly: 1099, name: "Fiber 500" },
];

test("hıza göre doğru satırı günceller", () => {
  const plan = matchAndPlan([{ speed: 250, price: 899 }], rows);
  assert.deepEqual(plan, [{ kind: "update", id: 2, oldPrice: 849, newPrice: 899 }]);
});

test("fiyat aynıysa güncelleme yapılmaz", () => {
  assert.deepEqual(matchAndPlan([{ speed: 100, price: 699 }], rows), [
    { kind: "unchanged", id: 1 },
  ]);
});

test("eşleşmeyen hız sessizce atlanır, rastgele satıra YAZILMAZ", () => {
  const plan = matchAndPlan([{ speed: 777, price: 599 }], rows);
  assert.equal(plan[0].kind, "skipped");
  assert.equal((plan[0] as any).id, undefined);
});

test("aynı hızda birden fazla paket varsa DOKUNULMAZ", () => {
  const ambiguous: DbRow[] = [
    { id: 1, downloadSpeed: 100, priceMonthly: 699, name: "Fiber 100" },
    { id: 2, downloadSpeed: 100, priceMonthly: 549, name: "Kablosuz 100" },
  ];
  const plan = matchAndPlan([{ speed: 100, price: 640 }], ambiguous);
  assert.equal(plan[0].kind, "skipped");
  assert.match((plan[0] as any).reason, /belirsiz/);
});

test("büyük fiyat sıçraması yayınlanmaz, onaya düşer", () => {
  const plan = matchAndPlan([{ speed: 100, price: 2500 }], rows);
  assert.equal(plan[0].kind, "skipped");
  assert.match((plan[0] as any).reason, /sapma/);
});

test("sınırdaki sapma kabul edilir", () => {
  // 699 → 900 ≈ %29, eşik %40
  assert.equal(matchAndPlan([{ speed: 100, price: 900 }], rows)[0].kind, "update");
});

// ─── Toplu güvenlik ───────────────────────────────────────────────────────────

test("hiç kayıt çıkmazsa tur iptal edilir", () => {
  const r = sanityCheck([], rows);
  assert.equal(r.ok, false);
});

test("hiçbir kayıt eşleşmiyorsa tur iptal edilir", () => {
  const r = sanityCheck([{ speed: 33, price: 500 }], rows);
  assert.equal(r.ok, false);
});

test("normal tarama geçer", () => {
  assert.equal(sanityCheck([{ speed: 100, price: 720 }], rows).ok, true);
});
