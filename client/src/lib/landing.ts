import { useQuery } from "@tanstack/react-query";
import { fetchPackages, fetchMobile } from "@/lib/api";
import { LANDINGS, filterPackages, filterMobile } from "@shared/landings";

/** Süzgeçsiz tam listeler — açılış sayfaları ve bağlantı bloğu paylaşır */
export function useAllPackages() {
  return useQuery({ queryKey: ["packages-all"], queryFn: () => fetchPackages() });
}

export function useAllMobile() {
  return useQuery({ queryKey: ["mobile-all"], queryFn: () => fetchMobile() });
}

/** Verisi olan açılış sayfaları (sunucudaki liveLandings ile aynı kural) */
export function useLiveLandings(): Set<string> {
  const pkgs = useAllPackages().data?.data ?? [];
  const mob = useAllMobile().data?.data ?? [];
  return new Set(
    LANDINGS.filter((l) =>
      l.kind === "internet" ? filterPackages(l, pkgs).length > 0 : filterMobile(l, mob).length > 0
    ).map((l) => l.path)
  );
}
