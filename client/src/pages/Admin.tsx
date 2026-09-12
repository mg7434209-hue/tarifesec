import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, RefreshCw, AlertTriangle, Check, Clock,
  TrendingUp, TrendingDown, Loader2, LogOut,
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

type Status = {
  scheduler: { enabled: boolean; intervalHours: number; running: boolean;
    lastRun: { at: string; changed: number; error?: string } | null };
  staleAfterHours: number;
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
      if (res.status === 503) throw new Error("ADMIN_SECRET sunucuda tanımlı değil");
      if (!res.ok) throw new Error("İstek başarısız");
      return res.json();
    },
    [secret]
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
          if (res.status === 503) throw new Error("Sunucuda ADMIN_SECRET tanımlı değil");
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

export default function Admin() {
  const [secret, setSecret] = useState<string | null>(() => sessionStorage.getItem(KEY));
  const [status, setStatus] = useState<Status | null>(null);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<number, string>>({});

  const api = useAdminApi(secret ?? "");

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

      <p className="text-xs text-gray-400 mt-4">
        Onayla, "fiyat değişti" rozetini karttan kaldırır. Fiyatı elle
        değiştirdiğinizde eski fiyat otomatik kaydedilir ve kartta üstü çizili görünür.
      </p>
    </div>
  );
}
