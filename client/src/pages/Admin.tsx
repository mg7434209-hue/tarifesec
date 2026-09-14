import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, RefreshCw, AlertTriangle, Check, Clock,
  TrendingUp, TrendingDown, Loader2, LogOut, KeyRound, Activity, CheckCircle2, XCircle,
} from "lucide-react";

/**
 * Yönetim paneli — /admin
 *
 * Menüde yoktur, robots.txt'te engellidir, sitemap dışındadır ve noindex
 * basar. Şifre yalnızca bellekte (sessionStorage) tutulur ve her istekte
 * x-admin-secret başlığıyla gönderilir.
 *
 * Bu panel olmadan Turkcell/Vodafone gibi otomatik taranamayan operatörlerin
 * fiyatları güncellenemiyordu — API vardı ama arayüz yoktu.
 */

const KEY = "tsec.admin";

type Pkg = {
  id: number; operator: string; name: string; priceMonthly: number;
  previousPrice: number | null; priceChanged: boolean;
  priceChangeDirection: string | null; downloadSpeed: number;
  lastScrapedAt: string | null; isActive: boolean;
};

type OperatorHealth = {
  operatorSlug: string; label: string; mode: string;
  lastSuccessAt: string | null; lastStatus: string | null; lastError: string | null;
  packageCount: number; lastCheckedAt: string | null; stale: boolean;
};

type Status = {
  scheduler: { enabled: boolean; intervalHours: number; running: boolean;
    lastRun: { at: string; changed: number; error?: string } | null };
  staleAfterHours: number;
  health?: { ok: boolean; summary: string; operators: OperatorHealth[] };
  counts: { total: number; stale: number; pendingApproval: number };
  sources: { operatorSlug: string; label: string; mode: string }[];
  staleItems: { id: number; operator: string; name: string; lastScrapedAt: string | null }[];
};

function useAdminApi(secret: string) {
  return useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(`/api/admin${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
          ...(init?.headers ?? {}),
        },
      });
      if (res.status === 401) throw new Error("Şifre hatalı");
      if (res.status === 503) throw new Error("Yönetim şifresi belirlenmemiş — sayfayı yenileyin");
      if (!res.ok) throw new Error("İstek başarısız");
      return res.json();
    },
    [secret]
  );
}

/** İlk kurulum — sunucuda hiç şifre yokken gösterilir */
function Kurulum({ onOk }: { onOk: (s: string) => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (pw !== pw2) return setError("Şifreler eşleşmiyor.");
        if (pw.length < 8) return setError("Şifre en az 8 karakter olmalı.");
        setBusy(true);
        try {
          const res = await fetch("/api/setup/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw }),
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body?.error ?? "Kurulum başarısız");
          sessionStorage.setItem(KEY, pw);
          onOk(pw);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      noValidate
      className="max-w-sm mx-auto mt-24 bg-white border border-gray-200 rounded-2xl p-8"
    >
      <ShieldCheck className="w-8 h-8 text-[#0097a7] mb-3" />
      <h1 className="text-lg font-bold text-gray-900 mb-1">İlk Kurulum</h1>
      <p className="text-sm text-gray-500 mb-5">
        Yönetim paneli için bir şifre belirleyin. Bu şifreyi kaydedin — yalnızca
        siz bileceksiniz.
      </p>

      <label className="text-xs text-gray-500 font-medium block mb-1">Şifre (en az 8 karakter)</label>
      <input
        type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus
        autoComplete="new-password"
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
      />
      <label className="text-xs text-gray-500 font-medium block mb-1">Şifre (tekrar)</label>
      <input
        type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
        autoComplete="new-password"
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
      />

      {error && <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>}

      <button
        disabled={busy || !pw || !pw2}
        className="w-full bg-[#0097a7] hover:bg-[#00838f] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
      >
        {busy ? "Kaydediliyor…" : "Şifreyi belirle ve gir"}
      </button>

      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-4">
        Bu ekran yalnızca bir kez gösterilir. Şifre belirlendikten sonra panele
        yalnızca bu şifreyle girilebilir.
      </p>
    </form>
  );
}

function Giris({ onOk }: { onOk: (s: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/admin/status", { headers: { "x-admin-secret": value } });
          if (res.status === 401) throw new Error("Şifre hatalı");
          if (res.status === 503) throw new Error("Yönetim şifresi belirlenmemiş — sayfayı yenileyin");
          if (!res.ok) throw new Error("Bağlanılamadı");
          sessionStorage.setItem(KEY, value);
          onOk(value);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="max-w-sm mx-auto mt-24 bg-white border border-gray-200 rounded-2xl p-8"
    >
      <ShieldCheck className="w-8 h-8 text-[#0097a7] mb-3" />
      <h1 className="text-lg font-bold text-gray-900 mb-1">Yönetim Paneli</h1>
      <p className="text-sm text-gray-500 mb-5">Devam etmek için admin şifresini girin.</p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
        placeholder="ADMIN_SECRET"
      />
      {error && <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>}
      <button
        disabled={busy || !value}
        className="w-full bg-[#0097a7] hover:bg-[#00838f] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
      >
        {busy ? "Kontrol ediliyor…" : "Giriş"}
      </button>
    </form>
  );
}

function Rozet({ tone, children }: { tone: "ok" | "warn" | "bad"; children: React.ReactNode }) {
  const cls = tone === "ok" ? "bg-green-50 text-green-700 border-green-200"
    : tone === "warn" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>;
}

function SifreDegistir({
  onMsg, onChanged,
}: {
  onMsg: (m: string) => void;
  /** Yeni şifreyi üst bileşene bildirir — aksi hâlde sonraki istekler
      eski şifreyle gider ve 401 alır. */
  onChanged: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [nxt, setNxt] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5"
      >
        <KeyRound className="w-4 h-4" /> Şifreyi değiştir
      </button>
    );
  }

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        if (nxt.length < 8) return setErr("Yeni şifre en az 8 karakter olmalı.");
        setBusy(true);
        try {
          const res = await fetch("/api/setup/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-secret": cur },
            body: JSON.stringify({ current: cur, next: nxt }),
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body?.error ?? "Değiştirilemedi");
          sessionStorage.setItem(KEY, nxt);
          onChanged(nxt);
          onMsg("Şifre değiştirildi. Yeni şifrenizi kaydedin.");
          setOpen(false);
          setCur(""); setNxt("");
        } catch (e2) {
          setErr((e2 as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="mt-6 bg-white border border-gray-200 rounded-xl p-5 max-w-sm"
    >
      <h2 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
        <KeyRound className="w-4 h-4 text-[#0097a7]" /> Şifre değiştir
      </h2>
      <input
        type="password" placeholder="Mevcut şifre" value={cur}
        onChange={(e) => setCur(e.target.value)} autoComplete="current-password"
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
      />
      <input
        type="password" placeholder="Yeni şifre (en az 8 karakter)" value={nxt}
        onChange={(e) => setNxt(e.target.value)} autoComplete="new-password"
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
      />
      {err && <p className="text-sm text-red-600 mb-2" role="alert">{err}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="bg-[#0097a7] hover:bg-[#00838f] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="text-sm text-gray-500 px-3">
          Vazgeç
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [secret, setSecret] = useState<string | null>(() => sessionStorage.getItem(KEY));
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<number, string>>({});

  const api = useAdminApi(secret ?? "");

  useEffect(() => {
    fetch("/api/setup/state")
      .then((r) => r.json())
      .then((d) => setSetupNeeded(Boolean(d.needsSetup)))
      .catch(() => setSetupNeeded(false));
  }, []);

  useEffect(() => {
    document.title = "Yönetim Paneli — tarifesec.net.tr";
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prev = meta?.content ?? null;
    if (meta) meta.content = "noindex, nofollow";
    return () => { if (meta && prev !== null) meta.content = prev; };
  }, []);

  const load = useCallback(async () => {
    if (!secret) return;
    try {
      const [s, p] = await Promise.all([api("/status"), api("/packages")]);
      setStatus(s);
      setPkgs(p);
    } catch (err) {
      setMsg((err as Error).message);
    }
  }, [api, secret]);

  useEffect(() => { void load(); }, [load]);

  if (setupNeeded === null) {
    return <p className="max-w-sm mx-auto mt-24 text-sm text-gray-400 text-center">Yükleniyor…</p>;
  }
  if (setupNeeded) return <Kurulum onOk={(s) => { setSetupNeeded(false); setSecret(s); }} />;
  if (!secret) return <Giris onOk={setSecret} />;

  const kaydet = async (id: number) => {
    const raw = edits[id];
    const price = Number(raw);
    if (!Number.isFinite(price) || price <= 0) return setMsg("Geçersiz fiyat");
    setBusy(true);
    try {
      await api(`/package/${id}`, { method: "PUT", body: JSON.stringify({ priceMonthly: price }) });
      setMsg("Fiyat güncellendi");
      setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
      await load();
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onayla = async (id: number) => {
    setBusy(true);
    try {
      await api(`/confirm-price/packages/${id}`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const tara = async () => {
    setBusy(true);
    try {
      const r = await api("/run-scraper", { method: "POST" });
      setMsg(r.message);
      setTimeout(() => void load(), 3000);
    } finally {
      setBusy(false);
    }
  };

  const stale = new Set(status?.staleItems.map((s) => s.id) ?? []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0097a7]" /> Yönetim Paneli
        </h1>
        <button
          onClick={() => { sessionStorage.removeItem(KEY); setSecret(null); }}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Çıkış
        </button>
      </div>

      {msg && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-4 py-2.5 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} aria-label="Kapat">×</button>
        </div>
      )}

      {/* Durum kartları */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Toplam paket", value: status.counts.total, tone: "ok" as const },
            { label: "Onay bekleyen", value: status.counts.pendingApproval, tone: status.counts.pendingApproval ? "warn" as const : "ok" as const },
            { label: `Bayat (${status.staleAfterHours}s+)`, value: status.counts.stale, tone: status.counts.stale ? "warn" as const : "ok" as const },
            { label: "Otomatik tarama", value: status.scheduler.enabled ? `${status.scheduler.intervalHours} saatte bir` : "kapalı", tone: status.scheduler.enabled ? "ok" as const : "bad" as const },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="text-lg font-bold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={tara}
          disabled={busy || status?.scheduler.running}
          className="inline-flex items-center gap-2 bg-[#0097a7] hover:bg-[#00838f] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
        >
          {status?.scheduler.running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {status?.scheduler.running ? "Tarama sürüyor…" : "Şimdi tara"}
        </button>
        <button onClick={() => void load()} className="text-sm text-gray-600 hover:text-gray-900">Yenile</button>
        {status?.scheduler.lastRun && (
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Son tur: {new Date(status.scheduler.lastRun.at).toLocaleString("tr-TR")}
            {" · "}{status.scheduler.lastRun.changed} değişiklik
            {status.scheduler.lastRun.error && ` · hata: ${status.scheduler.lastRun.error}`}
          </span>
        )}
      </div>

      {status && (
        <p className="text-xs text-gray-500 mb-4">
          Kaynaklar:{" "}
          {status.sources.map((s) => `${s.label} (${s.mode})`).join(" · ")}
        </p>
      )}

      {/* Tarama sağlığı — hangi operatör çalışıyor, hangisi bozuk */}
      {status?.health && (
        <div className="mb-6">
          {!status.health.ok && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900 text-sm mb-0.5">
                  Fiyat taraması sorunlu
                </div>
                <p className="text-sm text-red-700">{status.health.summary}</p>
                <p className="text-xs text-red-600 mt-1">
                  Aşağıdaki tablodan hangi operatörün güncellenmediğini görebilir,
                  fiyatları elle düzeltebilirsiniz.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0097a7]" />
              <h2 className="text-sm font-semibold text-gray-900">Operatör tarama durumu</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Operatör</th>
                    <th className="text-left px-4 py-2 font-medium">Yöntem</th>
                    <th className="text-left px-4 py-2 font-medium">Paket</th>
                    <th className="text-left px-4 py-2 font-medium">Son kontrol</th>
                    <th className="text-left px-4 py-2 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {status.health.operators.map((o) => (
                    <tr key={o.operatorSlug} className={o.stale ? "bg-red-50/40" : ""}>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{o.label}</td>
                      <td className="px-4 py-2.5 text-gray-500">{o.mode}</td>
                      <td className="px-4 py-2.5 text-gray-600">{o.packageCount}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {o.lastCheckedAt
                          ? new Date(o.lastCheckedAt).toLocaleString("tr-TR")
                          : "hiç"}
                      </td>
                      <td className="px-4 py-2.5">
                        {o.mode === "manuel" ? (
                          <Rozet tone="warn">elle güncellenir</Rozet>
                        ) : o.stale ? (
                          <div className="flex flex-col gap-1 items-start">
                            <Rozet tone="bad">
                              <XCircle className="w-3 h-3 inline" /> güncellenmiyor
                            </Rozet>
                            {o.lastError && (
                              <span className="text-[11px] text-red-600 max-w-xs block">
                                {o.lastError}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Rozet tone="ok">
                            <CheckCircle2 className="w-3 h-3 inline" /> çalışıyor
                          </Rozet>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Paket tablosu */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Operatör / Paket</th>
                <th className="text-left px-4 py-2.5 font-medium">Hız</th>
                <th className="text-left px-4 py-2.5 font-medium">Fiyat (₺/ay)</th>
                <th className="text-left px-4 py-2.5 font-medium">Durum</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pkgs.map((p) => (
                <tr key={p.id} className={p.priceChanged ? "bg-amber-50/40" : ""}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.operator}</div>
                    <div className="text-xs text-gray-500">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.downloadSpeed} Mbps</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={edits[p.id] ?? String(p.priceMonthly)}
                        onChange={(e) => setEdits((s) => ({ ...s, [p.id]: e.target.value }))}
                        className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
                      />
                      {edits[p.id] !== undefined && Number(edits[p.id]) !== p.priceMonthly && (
                        <button
                          onClick={() => kaydet(p.id)}
                          disabled={busy}
                          className="text-xs bg-[#0097a7] text-white px-2.5 py-1.5 rounded-lg font-medium"
                        >
                          Kaydet
                        </button>
                      )}
                    </div>
                    {p.previousPrice && (
                      <div className="text-xs text-gray-400 mt-1 line-through">{p.previousPrice} ₺</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      {p.priceChanged && (
                        <Rozet tone="warn">
                          {p.priceChangeDirection === "up"
                            ? <><TrendingUp className="w-3 h-3 inline" /> arttı</>
                            : <><TrendingDown className="w-3 h-3 inline" /> düştü</>}
                        </Rozet>
                      )}
                      {stale.has(p.id) && <Rozet tone="bad"><AlertTriangle className="w-3 h-3 inline" /> bayat</Rozet>}
                      {!p.priceChanged && !stale.has(p.id) && <Rozet tone="ok">güncel</Rozet>}
                      <span className="text-[11px] text-gray-400">
                        {p.lastScrapedAt
                          ? new Date(p.lastScrapedAt).toLocaleString("tr-TR")
                          : "hiç taranmadı"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.priceChanged && (
                      <button
                        onClick={() => onayla(p.id)}
                        disabled={busy}
                        className="text-xs border border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg font-medium inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Onayla
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SifreDegistir onMsg={setMsg} onChanged={setSecret} />

      <p className="text-xs text-gray-400 mt-4">
        Onayla, "fiyat değişti" rozetini karttan kaldırır. Fiyatı elle
        değiştirdiğinizde eski fiyat otomatik kaydedilir ve kartta üstü çizili görünür.
      </p>
    </div>
  );
}
