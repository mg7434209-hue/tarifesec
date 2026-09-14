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

  /** Yasal metinlerin son güncellenme tarihi */
  legalUpdatedAt: "2026-09-14",
} as const;

export const hasContactPhone = () => SITE_INFO.company.phone.trim().length > 0;
export const hasContactAddress = () => SITE_INFO.company.address.trim().length > 0;
