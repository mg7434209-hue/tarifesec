const BASE = "/api";

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
  const res = await fetch(`${BASE}/packages?${qs}`);
  if (!res.ok) throw new Error("Paketler yüklenemedi");
  return res.json();
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
  const res = await fetch(`${BASE}/mobile?${qs}`);
  if (!res.ok) throw new Error("Tarifeler yüklenemedi");
  return res.json();
}

export async function submitLead(data: {
  name?: string;
  phone: string;
  city?: string;
  packageInterest?: string;
}) {
  const res = await fetch(`${BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, source: "tarifesec" }),
  });
  if (!res.ok) throw new Error("Gönderim başarısız");
  return res.json();
}
