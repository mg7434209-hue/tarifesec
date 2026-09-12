const BASE = "/api";

/** Sayaç API'si yoksa istemcinin göstereceği asgari değer. */
export const VISITOR_MIN = 1000;

async function getJson(url: string, errMsg: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(errMsg);
  return res.json();
}

export async function fetchPackages(params?: {
  operator?: string;
  type?: string;
  minSpeed?: number;
  sort?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.operator) qs.set("operator", params.operator);
  if (params?.type) qs.set("type", params.type);
  if (params?.minSpeed) qs.set("minSpeed", String(params.minSpeed));
  if (params?.sort) qs.set("sort", params.sort);
  return getJson(`${BASE}/packages?${qs}`, "Paketler yüklenemedi");
}

export async function fetchMobile(params?: {
  operator?: string;
  isContract?: boolean;
  sort?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.operator) qs.set("operator", params.operator);
  if (params?.isContract !== undefined) qs.set("isContract", String(params.isContract));
  if (params?.sort) qs.set("sort", params.sort);
  return getJson(`${BASE}/mobile?${qs}`, "Tarifeler yüklenemedi");
}

export async function submitLead(data: {
  name?: string;
  phone: string;
  city?: string;
  packageInterest?: string;
  /** honeypot — insan kullanıcı doldurmaz */
  website?: string;
}) {
  const res = await fetch(`${BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, source: "tarifesec" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? "Gönderim başarısız");
  return body;
}

/** Ziyaretçi sayacı — gün içinde bir kez sayılır, toplam 1000'den başlar. */
export async function fetchVisitors(): Promise<{ total: number; today: number }> {
  try {
    const data = await getJson(`${BASE}/visitors`, "Sayaç okunamadı");
    return { total: Number(data.total) || VISITOR_MIN, today: Number(data.today) || 0 };
  } catch {
    return { total: VISITOR_MIN, today: 0 };
  }
}

export async function fetchBlogPosts() {
  return getJson(`${BASE}/blog`, "Yazılar yüklenemedi");
}

export async function fetchSpeedStats(): Promise<{
  avgDownload: number;
  avgUpload: number;
  avgPing: number;
  total: number;
}> {
  try {
    return await getJson(`${BASE}/speedtest/stats`, "İstatistik okunamadı");
  } catch {
    return { avgDownload: 0, avgUpload: 0, avgPing: 0, total: 0 };
  }
}

export async function saveSpeedResult(r: {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
}) {
  try {
    await fetch(`${BASE}/speedtest/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    });
  } catch {
    /* sonuç kaydı kritik değil, sessiz geç */
  }
}
