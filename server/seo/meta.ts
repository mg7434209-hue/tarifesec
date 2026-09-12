/**
 * Rota meta verisi paylaşılan kaynaktan gelir (shared/routes.ts) —
 * sunucu ve istemci aynı başlık/açıklamayı kullanır.
 */
import { config } from "../config";

export { ROUTES, byPath, type RouteMeta } from "../../shared/routes";

export const SITE = config.site.url;
export const SITE_NAME = "tarifesec.net.tr";
