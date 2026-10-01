/**
 * Site kimlik ve iletişim bilgileri — TEK DOĞRU KAYNAK.
 *
 * ⚠️ DOLDURULMASI GEREKİYOR: aşağıdaki iletişim ve şirket bilgileri yer
 * tutucudur. KVKK aydınlatma metninin geçerli olması için veri sorumlusunun
 * gerçek kimliği ve başvuru adresi yazılmalıdır. Yayına almadan önce
 * güncelleyin.
 */
export const SITE_INFO = {
  name: "tarifesec.net.tr",
  url: "https://www.tarifesec.net.tr",

  /** Veri sorumlusu — KVKK aydınlatma metninde geçer */
  company: {
    /** ⚠️ Gerçek unvanı yazın (şahıs şirketi ise ad-soyad) */
    legalName: "tarifesec.net.tr",
    /** ⚠️ Başvuruların ulaşacağı gerçek e-posta */
    email: "info@tarifesec.net.tr",
    /** ⚠️ Boş bırakılırsa telefon gösterilmez */
    phone: "",
    /** ⚠️ Boş bırakılırsa adres gösterilmez */
    address: "",
  },

  /** Kurumsal sayfaların (hakkımızda, iletişim) son içerik güncellemesi */
  contentUpdatedAt: "2026-09-25",

  /** Yasal metinlerin son güncellenme tarihi */
  legalUpdatedAt: "2026-09-14",
} as const;

export const hasContactPhone = () => SITE_INFO.company.phone.trim().length > 0;
export const hasContactAddress = () => SITE_INFO.company.address.trim().length > 0;

/**
 * Aynı ekibe ait diğer siteler — TEK DOĞRU KAYNAK.
 * Sayfanın en üstündeki şerit (Layout.tsx), footer ve llms.txt buradan okur.
 * Kendi sitelerimiz olduğu için bağlantılar "sponsored" DEĞİLDİR; yine de
 * ziyaretçiye ayrı bir site olduğu açıkça yazılır.
 */
export const SISTER_SITES = [
  {
    id: "gespa",
    name: "GESPA Enerji",
    url: "https://www.gespaenerji.com",
    host: "www.gespaenerji.com",
    tagline: "Güneş enerjisi (GES) kurulumu ve solar ürünler",
  },
  {
    id: "goksoylar",
    name: "Göksoylar",
    url: "https://www.goksoylar.com.tr",
    host: "www.goksoylar.com.tr",
    tagline: "Güneş enerji sistemleri · Manavgat",
  },
] as const;
