/**
 * Yasal metinler — hem sunucu (SSR) hem istemci buradan okur.
 *
 * KVKK (6698 sayılı kanun) madde 10, kişisel veri toplanırken veri sorumlusunun
 * kimliğini, verinin hangi amaçla işleneceğini, kimlere aktarılacağını ve
 * ilgili kişinin haklarını BİLDİRMEYİ zorunlu kılar. Site ad, telefon ve şehir
 * topladığı için bu metin yasal bir gerekliliktir, tercih değildir.
 *
 * ⚠️ Bu metinler iyi niyetli bir taslaktır, hukuki danışmanlık değildir.
 * Ticari faaliyet büyüdükçe bir hukukçuya gözden geçirtin.
 */
import { SITE_INFO } from "./site";

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
};

const veriSorumlusu = SITE_INFO.company.legalName;
const iletisim = SITE_INFO.company.email;

export const KVKK: LegalDoc = {
  slug: "kvkk",
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl işlendiğine dair aydınlatma metni.",
  intro:
    `Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ` +
    `uyarınca, ${veriSorumlusu} tarafından veri sorumlusu sıfatıyla hazırlanmıştır.`,
  sections: [
    {
      heading: "Hangi verileri topluyoruz?",
      paragraphs: [
        "Teklif talep formunu doldurduğunuzda: adınız (isteğe bağlı), telefon numaranız (zorunlu), şehriniz (isteğe bağlı) ve ilgilendiğiniz paket bilgisi.",
        "Siteyi ziyaret ettiğinizde: ziyaretçi sayımı için tarayıcınıza yerleştirilen teknik bir çerez. Bu çerez kimliğinizi taşımaz, yalnızca aynı ziyaretçinin gün içinde bir kez sayılmasını sağlar.",
        "Hız testi yaptığınızda: ölçüm sonuçları (indirme, yükleme, gecikme) anonim olarak kaydedilir. IP adresiniz veya sizi tanımlayacak başka bir bilgi bu kayda eklenmez.",
      ],
    },
    {
      heading: "Verileriniz hangi amaçla işleniyor?",
      paragraphs: [
        "Telefon numaranız ve adınız, yalnızca talebiniz üzerine sizinle iletişime geçip size uygun tarife seçeneklerini anlatmak amacıyla işlenir.",
        "Şehir bilginiz, bulunduğunuz bölgede hangi altyapının mevcut olduğunu değerlendirmek için kullanılır.",
        "Çerez ve hız testi verileri, sitenin kullanım istatistiklerini çıkarmak ve hizmeti geliştirmek için toplu (anonim) olarak kullanılır.",
      ],
    },
    {
      heading: "Hukuki sebep",
      paragraphs: [
        "Teklif formunu doldurmanız hâlinde verileriniz, KVKK 5/1 uyarınca açık rızanıza dayanılarak işlenir. Formu göndermeden önce bu metni onaylamanız istenir.",
        "Teknik çerez, KVKK 5/2-f uyarınca meşru menfaat kapsamında kullanılır; kişiselleştirme veya reklam amacı taşımaz.",
      ],
    },
    {
      heading: "Verileriniz kimlerle paylaşılıyor?",
      paragraphs: [
        "Kişisel verileriniz üçüncü kişilere satılmaz, kiralanmaz veya pazarlama amacıyla aktarılmaz.",
        "Verileriniz, sitenin barındırıldığı sunucu altyapısında saklanır. Yasal bir zorunluluk doğması hâlinde yetkili kamu kurumlarıyla paylaşılabilir.",
      ],
    },
    {
      heading: "Ne kadar süre saklanıyor?",
      paragraphs: [
        "Teklif talebiniz, sizinle iletişime geçilip talebiniz sonuçlandıktan sonra makul bir süre içinde silinir.",
        "Talebinizin silinmesini daha erken istiyorsanız aşağıdaki adresten başvurabilirsiniz.",
      ],
    },
    {
      heading: "Haklarınız",
      paragraphs: [
        "KVKK 11. madde uyarınca; kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme ve zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
        `Bu haklarınızı kullanmak için ${iletisim} adresine başvurabilirsiniz. Talebiniz en geç 30 gün içinde sonuçlandırılır.`,
      ],
    },
  ],
};

export const GIZLILIK: LegalDoc = {
  slug: "gizlilik",
  title: "Gizlilik Politikası",
  description:
    "tarifesec.net.tr olarak kişisel verilerinizi nasıl koruduğumuzu ve hangi bilgileri sakladığımızı açıklıyoruz.",
  intro:
    "Bu politika, siteyi kullanırken hangi bilgilerin toplandığını, nasıl korunduğunu ve haklarınızı sade bir dille açıklar.",
  sections: [
    {
      heading: "Kısaca",
      paragraphs: [
        "Siteyi gezmek için hiçbir bilgi vermeniz gerekmez. Yalnızca teklif formunu kendi isteğinizle doldurursanız iletişim bilginizi almış oluruz.",
        "Bilgilerinizi satmıyoruz, kiralamıyoruz ve pazarlama listelerine eklemiyoruz.",
      ],
    },
    {
      heading: "Güvenlik",
      paragraphs: [
        "Site HTTPS üzerinden sunulur; tarayıcınız ile sunucu arasındaki trafik şifrelenir.",
        "Yönetim paneli şifre korumalıdır ve şifre düz metin olarak saklanmaz.",
        "Buna rağmen internet üzerinden yapılan hiçbir aktarımın %100 güvenli olduğu garanti edilemez.",
      ],
    },
    {
      heading: "Dış bağlantılar",
      paragraphs: [
        "Sitede operatörlerin resmi sayfalarına ve iş ortaklarımıza giden bağlantılar bulunur. Bu sitelere gittiğinizde onların kendi gizlilik politikaları geçerlidir.",
        "Sponsorlu bağlantılar sitede açıkça 'reklam' olarak işaretlenir ve karşılaştırma sonuçlarının sıralamasını etkilemez.",
      ],
    },
    {
      heading: "Değişiklikler",
      paragraphs: [
        `Bu politika güncellenebilir. Son güncelleme: ${SITE_INFO.legalUpdatedAt}.`,
      ],
    },
  ],
};

export const CEREZ: LegalDoc = {
  slug: "cerez-politikasi",
  title: "Çerez Politikası",
  description:
    "tarifesec.net.tr'de kullanılan çerezler, ne işe yaradıkları ve nasıl yönetebileceğiniz.",
  intro:
    "Çerez, siteyi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük bir metin dosyasıdır. Bu sitede yalnızca zorunlu ve teknik çerezler kullanılır.",
  sections: [
    {
      heading: "Kullanılan çerezler",
      paragraphs: [
        "Ziyaretçi sayacı çerezi (tsv): Aynı ziyaretçinin gün içinde birden fazla sayılmasını engeller. Gün sonunda kendiliğinden silinir. Kimliğinizi, konumunuzu veya gezinme geçmişinizi taşımaz.",
        "Sitede reklam takip çerezi, üçüncü taraf analiz çerezi veya sosyal medya piksel kodu BULUNMAZ.",
      ],
    },
    {
      heading: "Tarayıcı depolaması",
      paragraphs: [
        "Yönetim paneline giriş yaptığınızda şifreniz yalnızca o sekme açık kaldığı sürece tarayıcınızın oturum belleğinde tutulur; sekmeyi kapattığınızda silinir.",
      ],
    },
    {
      heading: "Çerezleri nasıl yönetirsiniz?",
      paragraphs: [
        "Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ziyaretçi sayacı çerezini engellerseniz site normal çalışmaya devam eder; yalnızca ziyaretiniz sayıma birden fazla kez yansıyabilir.",
      ],
    },
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [KVKK, GIZLILIK, CEREZ];
export const legalBySlug = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug);
