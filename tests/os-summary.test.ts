/**
 * Gespa OS özeti — belirteç kapısı ve kişisel veri ayıklama. Veritabanı GEREKMEZ.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";
import osRouter, { leadPublic, tokenOk, osToken } from "../server/routes/os";

after(() => setTimeout(() => process.exit(0), 50).unref());

const TOKEN = "os-test-belirteci-0123456789abcdefghij";

async function withServer(fn: (base: string) => Promise<void>) {
  const app = express();
  app.use("/api/os", osRouter);
  const srv = app.listen(0);
  try { await fn(`http://127.0.0.1:${(srv.address() as AddressInfo).port}`); } finally { srv.close(); }
}

test("OS_TOKEN kısa ya da yoksa uç kapalı (503)", async () => {
  process.env.OS_TOKEN = "kisa";
  assert.equal(osToken(), "");
  await withServer(async (b) => {
    const r = await fetch(b + "/api/os/summary", { headers: { "X-OS-Token": "kisa" } });
    assert.equal(r.status, 503);
  });
});

test("belirteçsiz/yanlış belirteç 403, POST 405", async () => {
  process.env.OS_TOKEN = TOKEN;
  await withServer(async (b) => {
    assert.equal((await fetch(b + "/api/os/summary")).status, 403);
    assert.equal((await fetch(b + "/api/os/summary", { headers: { "X-OS-Token": TOKEN + "x" } })).status, 403);
    assert.equal((await fetch(b + "/api/os/summary", { method: "POST", headers: { "X-OS-Token": TOKEN } })).status, 405);
  });
  assert.ok(tokenOk(TOKEN, TOKEN) && !tokenOk(undefined, TOKEN) && !tokenOk(TOKEN, ""));
});

test("başvuru özeti ad, telefon ve not taşımaz", () => {
  const out = leadPublic({
    id: 7, name: "Ayşe Gizli", phone: "05551112233", city: "Antalya", packageInterest: "100 Mbps Fiber",
    source: "tarifesec", isContacted: false, notes: "akşam arayın", createdAt: new Date(),
  } as any);
  const raw = JSON.stringify(out);
  for (const leak of ["Ayşe", "0555", "akşam"]) assert.ok(!raw.includes(leak), "sızıntı: " + leak);
  assert.deepEqual(Object.keys(out).sort(), ["city", "contacted", "createdAt", "id", "packageInterest", "source"]);
});
