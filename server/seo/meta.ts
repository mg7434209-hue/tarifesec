/**
 * Rota meta verisi paylaşılan kaynaktan gelir (shared/routes.ts) —
 * sunucu ve istemci aynı başlık/açıklamayı kullanır.
 */
import { config } from "../config";

export { ROUTES, byPath, type RouteMeta } from "../../shared/routes";

export const SITE = config.site.url;
export const SITE_NAME = "tarifesec.net.tr";

/** Paylaşım görseli — sosyal ağlar SVG kabul etmez; raster (1200×630). */
export const OG_IMAGE = { url: `${SITE}/og-tarifesec.jpg`, width: 1200, height: 630, type: "image/jpeg" };
/** Organization logosu — Google raster ve en az 112×112 ister. */
export const LOGO = { url: `${SITE}/logo-512.png`, width: 512, height: 512 };
