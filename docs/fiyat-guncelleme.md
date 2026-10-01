# Fiyat güncelleme prosedürü (3 günde bir)

Sitedeki her paket ve tarife fiyatının güncel kalması için bu prosedür
**3 günde bir** çalıştırılır (Claude Code rutini; elle de uygulanabilir).
Otomatik tarayıcı (`scraper/`, 12 saatte bir) yalnızca Superonline, Türk
Telekom ve TurkNet sayfalarını dener ve seçicileri canlıda doğrulanmamıştır;
bu prosedür onun yedeğidir ve TÜM operatörleri kapsar.

## İlke: emin değilsen yayınlama

- Yanlış fiyat, eksik fiyattan kötüdür. Kaynak gösterilemeyen rakam yazılmaz.
- Kaynak önceliği: **operatörün resmi sayfası** (superonline.net, turk.net,
  bireysel.turktelekom.com.tr, vodafone.com.tr, turkcell.com.tr) > en az iki
  bağımsız haber kaynağı > (kabul edilmez) karşılaştırma/forum siteleri.
- Kampanya fiyatı yazılıyorsa koşulu (taahhüt süresi, bitiş tarihi, "ilk N ay")
  `features` içinde belirtilir.
- Doğrulanamayan kayıt tahmini fiyatla bırakılmaz: `set: { isActive: false }`
  ile yayından kalkar. Fiyat bulununca yeniden açılır (`isActive: true`).
- Operatör paketi satıştan kaldırdıysa satır en yakın güncel ürüne çevrilir
  (`replaces: true` — "fiyat arttı" rozeti çıkmaz, farklı ürün kıyaslanmaz).

## Adımlar

1. `drizzle/seed-data.ts` içindeki her paket/tarife için güncel fiyatı ara
   (WebSearch; bulut ortamı operatör sitelerini doğrudan açamaz).
   Kampanya bitiş tarihi geçmiş kayıtlar ÖNCELİKLİ kontrol edilir.
2. Değişen her kayıt için `drizzle/data-updates.ts` → `DATA_UPDATES`'e yeni
   `id`'li kayıt ekle (`YYYY-MM-DD-operator-ürün`):
   - `match` = seed-data.ts'teki ŞU ANKİ `operatorSlug` + `name`
   - `expectPrice` = seed-data.ts'teki ŞU ANKİ fiyat
   - `set` = yalnız değişen alanlar; `source` = kaynak + doğrulama tarihi
   Eski kayıtları SİLME (canlı veritabanı hangi kaydın uygulandığını tutar).
3. Aynı değişikliği `drizzle/seed-data.ts`'e de işle (yeni kurulum güncel başlasın).
   Yeni bir ürün eklenecekse seed-data.ts'e yazmak yetmez — canlı tablo dolu
   olduğu için eklenmez; o durumda kullanıcıya admin panelinden eklemesini söyle.
4. Değişen kapsamı metinlerle tutarlı tut: `shared/routes.ts`,
   `shared/landings.ts` açıklamaları listede OLMAYAN operatörü anmamalı.
   Kampanya tarihi geçen ifadeleri (`features`, rehber yazıları) düzelt.
5. `npm test` ve `npm run build` temiz geçmeli.
6. Commit mesajı: hangi fiyatlar değişti, kaynakları, kaldırılan/açılan kayıtlar.
   Değişiklik yoksa commit ATMA; kısa bir "değişiklik yok" notu yeterli.
7. Yayın: değişiklik `main`'e birleşince Railway dağıtır; açılışta
   `server/bootstrap.ts` → `applyDataUpdates()` her kaydı bir kez uygular.
   Admin elle farklı bir fiyat girdiyse (`expectPrice` tutmaz) satıra
   dokunulmaz ve günlüğe "atlandı" yazılır — bu durumu kullanıcıya bildir.

## Kontrol listesi (her turda)

- [ ] Ev interneti: Superonline (fiber + Superbox), Türk Telekom, TurkNet, Vodafone
- [ ] Mobil: Turkcell, Vodafone, Türk Telekom (faturalı + faturasız)
- [ ] Yayından kaldırılmış kayıtlar (`isActive: false`) için fiyat bulundu mu?
- [ ] Kampanya bitiş tarihleri (`features` içindeki "… 'ya kadar") geçti mi?
- [ ] 5G, zam, mevzuat gibi SSS/rehber bilgileri hâlâ doğru mu?
