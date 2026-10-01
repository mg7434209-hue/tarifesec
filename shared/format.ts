/**
 * Paket hız metni. downloadSpeed = 0 → sabit hız yok (5G kablosuz internet:
 * hız kapsamaya ve yoğunluğa bağlıdır). Operatörün "1000 Mbps'ye varan"
 * gibi üst sınırını kesin hız diye yazmamak için 0 kullanılır.
 */
export const speedText = (mbps: number | null | undefined) =>
  mbps && mbps > 0 ? `${mbps} Mbps` : "hız kapsamaya bağlı";

export const speedTextLong = (mbps: number | null | undefined) =>
  mbps && mbps > 0 ? `${mbps} Mbps indirme` : "hız kapsamaya bağlı (5G)";
