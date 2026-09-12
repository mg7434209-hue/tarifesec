import { useEffect, useRef, useState } from "react";
import { byPath } from "@shared/routes";

/**
 * Belirtilen başlangıçtan hedefe yumuşak sayan animasyon (easeOutExpo).
 * `from` verilirse sayaç o değerin ALTINA hiç düşmez — ziyaretçi rozetinin
 * her zaman 1000+ görünmesi bu sayede garanti edilir.
 */
export function useCountUp(target: number, durationMs = 1600, from = 0) {
  const [value, setValue] = useState(from);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!Number.isFinite(target) || target <= from) {
      setValue(Math.max(target, from));
      return;
    }

    // Hareket azaltma tercihi varsa animasyon yok
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs, from]);

  return value;
}

type SeoOptions = {
  title: string;
  description?: string;
  canonicalPath?: string;
};

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Canonical kökü, sunucunun ilk yüklemede bastığı <link rel="canonical">
 * değerinden okunur. window.location.origin KULLANILMAZ: ziyaretçi siteye
 * farklı bir alan adından (www'siz, *.up.railway.app) gelirse canonical
 * yanlış kök alır ve sayfa kendi kopyasını işaret ederdi.
 */
function canonicalBase(): string {
  const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link?.href) {
    try {
      return new URL(link.href).origin;
    } catch {
      /* düş */
    }
  }
  return window.location.origin;
}

/**
 * Sayfa başına başlık/açıklama/canonical.
 *
 * İlk yüklemede bu değerleri sunucu zaten basar (server/seo/render.ts);
 * bu kanca yalnızca SPA içi gezinmede günceller ve AYNI paylaşılan metni
 * kullanır (shared/routes.ts), böylece sunucu ile istemci başlığı ayrışmaz.
 *
 * JSON-LD'ye DOKUNMAZ — yapılandırılmış veriyi yalnızca sunucu üretir,
 * aksi hâlde aynı şema iki kez gömülürdü.
 */
export function useSeo({ title, description, canonicalPath }: SeoOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    }
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);

    const url = `${canonicalBase()}${canonicalPath ?? window.location.pathname}`;
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [title, description, canonicalPath]);
}

/** Paylaşılan rota meta verisinden useSeo çağrısı. */
export function useRouteSeo(path: string) {
  const meta = byPath(path);
  useSeo({
    title: meta?.title ?? "tarifesec.net.tr",
    description: meta?.description,
    canonicalPath: path,
  });
}

/** features alanı bozuk JSON içerebilir — sayfayı çökertmeden boş dizi döner. */
export function parseFeatures(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((f) => typeof f === "string") : [];
  } catch {
    return [];
  }
}
