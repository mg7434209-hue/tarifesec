/**
 * Başlıklardaki yıl ("… 2026") — elle yazılmaz. Yeni yılda ilk dağıtım /
 * yeniden başlatmayla kendiliğinden güncellenir (Türkiye saatiyle).
 * Arama sorgularının çoğu yıl içerir ("internet paketleri 2027"); eski yıl
 * yazan başlık hem tıklanmaz hem bayat görünür.
 */
export const YIL = new Date(Date.now() + 3 * 60 * 60 * 1000).getUTCFullYear();
