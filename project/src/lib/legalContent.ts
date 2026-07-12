/** Legal copy for NexReward — review with a qualified attorney before production use. */

export const LEGAL_META = {
  appName: 'NexReward',
  providerName: 'NeşveNext',
  lastUpdated: '12 Temmuz 2026',
  contactEmail: 'destek@nexreward.com',
  jurisdiction: 'Türkiye Cumhuriyeti',
} as const;

/** Short bullets shown on the sign-up page before users accept. */
export const SIGNUP_KEY_POINTS = [
  'NexReward bir sadakat ve ödül platformudur; kazanılan puanlar promosyon niteliğindedir ve nakit para veya yasal ödeme aracı değildir.',
  'Puan, ödül ve kampanya kuralları önceden haber verilmeksizin değiştirilebilir, askıya alınabilir veya sonlandırılabilir.',
  'Hile, sahte hesap, bot kullanımı veya sistemi suistimal etmek hesabınızın kalıcı olarak kapatılmasına yol açar.',
  '18 yaşından küçükseniz ebeveyn veya yasal temsilci izni olmadan kayıt olamazsınız.',
  'Kişisel verileriniz KVKK kapsamında işlenir; ayrıntılar Gizlilik Politikasında açıklanmıştır.',
  'Hizmeti kullanarak Kullanım Şartları ve Gizlilik Politikasını okuduğunuzu ve kabul ettiğinizi beyan edersiniz.',
] as const;

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'intro',
    title: '1. Giriş ve Kabul',
    paragraphs: [
      `Bu Kullanım Şartları ve Platform Kuralları ("Şartlar"), ${LEGAL_META.appName} sadakat ve ödül platformunun ("Platform") kullanımına ilişkin koşulları düzenler.`,
      'Kayıt olarak, giriş yaparak veya Platformu herhangi bir şekilde kullanarak bu Şartları, Gizlilik Politikasını ve güncel kampanya kurallarını okuduğunuzu, anladığınızı ve bağlayıcı olarak kabul ettiğinizi beyan edersiniz.',
      'Bu Şartları kabul etmiyorsanız Platformu kullanmayınız.',
    ],
  },
  {
    id: 'service',
    title: '2. Hizmetin Tanımı',
    paragraphs: [
      'Platform; alışveriş, görev, mini oyun, QR kod ve benzeri etkinlikler karşılığında puan kazanmanızı, seviye atlamanızı ve belirli ödüllere erişmenizi sağlayan dijital bir sadakat programıdır.',
      'Platform bir finansal kurum değildir. Puanlar promosyon amaçlıdır; yatırım, menkul kıymet veya mevduat niteliği taşımaz.',
    ],
  },
  {
    id: 'eligibility',
    title: '3. Uygunluk ve Hesap',
    paragraphs: [
      'Platformu kullanmak için en az 18 yaşında olmanız veya yasal temsilcinizin açık iznine sahip olmanız gerekir.',
      'Kayıt sırasında doğru, güncel ve eksiksiz bilgi vermekle yükümlüsünüz. Hesap bilgilerinizin gizliliğinden ve hesabınız üzerinden yapılan tüm işlemlerden siz sorumlusunuz.',
      'Bir kişi yalnızca bir müşteri hesabı açabilir. Aynı kişiye ait birden fazla hesap tespit edilirse tüm hesaplar askıya alınabilir veya kapatılabilir.',
    ],
  },
  {
    id: 'points',
    title: '4. Puanlar, Ödüller ve Kampanyalar',
    paragraphs: [
      'Puan kazanma, harcama, seviye ve ödül koşulları Platform içinde veya resmi duyurularda belirtilen kurallara tabidir.',
      'Puanların nakit karşılığı yoktur; devredilemez, satılamaz ve Platform dışında kullanılamaz (aksi açıkça yazılmadıkça).',
      'Teknik hata, sistem arızası veya hile şüphesi halinde haksız kazanılan puanlar geri alınabilir.',
    ],
    bullets: [
      'Users can claim loyalty points up to the maximum points limit set by the website administrator. Once the maximum limit is reached, users will no longer be able to claim additional points unless the administrator changes the limit or resets the user’s eligibility. The current default maximum limit is 1200 points.',
      'Ödül stokları, kampanya süreleri ve puan çarpanları önceden bildirim yapılmaksızın değiştirilebilir.',
      'Kullanılmayan puanlar belirli bir süre sonra sıfırlanabilir; süre Platform içinde duyurulur.',
      'Ödül teslimatı üçüncü taraf tedarikçilere bağlı olabilir; gecikme veya stok tükenmesi halinde eşdeğer ödül veya iade puanı sunulabilir.',
    ],
  },
  {
    id: 'conduct',
    title: '5. Yasaklı Davranışlar',
    paragraphs: ['Aşağıdaki davranışlar kesinlikle yasaktır ve hesabın derhal askıya alınmasına veya kalıcı kapatılmasına neden olabilir:'],
    bullets: [
      'Bot, script, otomasyon veya hile yazılımı kullanmak',
      'Sahte kimlik, sahte e-posta veya başkasının hesabını kullanmak',
      'Aynı işlemi tekrarlayarak sistemi suistimal etmek',
      'Platform güvenliğini tehdit eden girişimlerde bulunmak',
      'Hakaret, tehdit, yasa dışı içerik veya telif ihlali içeren paylaşımlar',
      'Personel veya diğer kullanıcıları aldatmaya yönelik dolandırıcılık girişimleri',
    ],
  },
  {
    id: 'suspension',
    title: '6. Askıya Alma ve Fesih',
    paragraphs: [
      'Şartları ihlal etmeniz, şüpheli aktivite tespit edilmesi veya yasal zorunluluk halinde hesabınız geçici olarak askıya alınabilir veya kalıcı olarak kapatılabilir.',
      'Askıya alınan hesaplarda puan kazanma, oyun oynama ve ödül kullanımı devre dışı bırakılabilir.',
      'Hesabınızı dilediğiniz zaman destek kanalları üzerinden kapatma talebinde bulunabilirsiniz; kapatma sonrası verileriniz Gizlilik Politikasına uygun şekilde işlenir.',
    ],
  },
  {
    id: 'liability',
    title: '7. Sorumluluk Sınırı',
    paragraphs: [
      'Platform "olduğu gibi" sunulur. Kesintisiz, hatasız veya belirli bir sonuç garantisi verilmez.',
      'Mücbir sebep, bakım çalışması, üçüncü taraf hizmet kesintileri veya kullanıcı kaynaklı hatalardan doğan dolaylı zararlardan sorumluluk kabul edilmez.',
      'Yürürlükteki zorunlu tüketici mevzuatı kapsamındaki haklarınız saklıdır.',
    ],
  },
  {
    id: 'changes',
    title: '8. Değişiklikler',
    paragraphs: [
      'Bu Şartlar zaman zaman güncellenebilir. Önemli değişiklikler Platform üzerinden veya kayıtlı e-posta adresinize bildirilebilir.',
      'Güncelleme sonrası Platformu kullanmaya devam etmeniz, yeni Şartları kabul ettiğiniz anlamına gelir.',
      `Son güncelleme: ${LEGAL_META.lastUpdated}.`,
    ],
  },
  {
    id: 'law',
    title: '9. Uygulanacak Hukuk ve Uyuşmazlık',
    paragraphs: [
      `Bu Şartlar ${LEGAL_META.jurisdiction} kanunlarına tabidir.`,
      'Uyuşmazlıklarda öncelikle destek kanalları üzerinden çözüm aranması tavsiye edilir. Çözülemeyen uyuşmazlıklarda yetkili tüketici hakem heyetleri ve tüketici mahkemeleri devreye girebilir.',
      `Sorularınız için: ${LEGAL_META.contactEmail}`,
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'controller',
    title: '1. Veri Sorumlusu',
    paragraphs: [
      `${LEGAL_META.appName}, ${LEGAL_META.providerName} tarafından sunulan bir sadakat ve ödül platformudur. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu ${LEGAL_META.providerName}'tir.`,
      `İletişim: ${LEGAL_META.contactEmail}`,
    ],
  },
  {
    id: 'data',
    title: '2. İşlenen Kişisel Veriler',
    paragraphs: ['Platform kapsamında aşağıdaki veri kategorileri işlenebilir:'],
    bullets: [
      'Kimlik ve iletişim: kullanıcı adı, e-posta, telefon (isteğe bağlı)',
      'Hesap ve işlem: puan bakiyesi, seviye, görev/oyun geçmişi, ödül kullanım kayıtları',
      'Teknik veriler: IP adresi, cihaz/tarayıcı bilgisi, oturum kayıtları, hata logları',
      'Tercihler: bildirim ayarları, gizlilik tercihleri, tema seçimi',
      'Destek: destek talepleri ve yazışma içerikleri',
    ],
  },
  {
    id: 'google-sign-in',
    title: '3. Google ile Giriş Verileri',
    paragraphs: [
      'Google ile giriş yapmayı seçtiğinizde yalnızca kimlik doğrulama ve hesap oluşturma/bağlama için gerekli temel profil bilgileri alınır. Google hesabınızın şifresine erişmeyiz.',
      'Google kullanıcı verileri reklam hedefleme amacıyla kullanılmaz, satılmaz ve hizmetin sunulması için gerekli teknik altyapı sağlayıcıları dışında üçüncü taraflarla paylaşılmaz.',
      'Google kullanıcı verilerini kullanımımız, Google API Hizmetleri Kullanıcı Verileri Politikası ve Sınırlı Kullanım gereksinimleriyle uyumludur.',
    ],
    bullets: [
      'Google hesabına ait benzersiz kullanıcı kimliği',
      'E-posta adresi',
      'Görünen ad ve varsa profil fotoğrafı',
      'Oturum açma ve hesap güvenliği için gerekli kimlik doğrulama kayıtları',
    ],
  },
  {
    id: 'purposes',
    title: '4. İşleme Amaçları',
    paragraphs: ['Kişisel verileriniz aşağıdaki amaçlarla işlenir:'],
    bullets: [
      'Üyelik oluşturma, kimlik doğrulama ve hesap yönetimi',
      'Sadakat programı, puan hesaplama ve ödül sunumu',
      'Dolandırıcılık ve suistimalin önlenmesi, güvenlik denetimi',
      'Yasal yükümlülüklerin yerine getirilmesi',
      'Kullanıcı desteği ve şikâyet yönetimi',
      'Açık rızanız halinde pazarlama bildirimleri ve kampanya duyuruları',
      'Hizmet kalitesinin ölçülmesi ve iyileştirilmesi',
    ],
  },
  {
    id: 'legal-basis',
    title: '5. Hukuki Sebepler',
    paragraphs: ['KVKK m. 5 ve m. 6 kapsamında verileriniz şu hukuki sebeplere dayanılarak işlenir:'],
    bullets: [
      'Bir sözleşmenin kurulması veya ifası (üyelik ve hizmet sunumu)',
      'Veri sorumlusunun meşru menfaati (güvenlik, dolandırıcılık önleme)',
      'Hukuki yükümlülük (resmi makam talepleri, kayıt saklama)',
      'Açık rıza (pazarlama bildirimleri ve isteğe bağlı özellikler)',
    ],
  },
  {
    id: 'transfer',
    title: '6. Aktarım ve Yurt Dışı',
    paragraphs: [
      'Verileriniz; barındırma ve kimlik doğrulama altyapısı sağlayan Supabase ile analitik ve bildirim hizmeti sağlayıcıları gibi teknik altyapı ortaklarıyla, hizmetin sunulması için gerekli ölçüde paylaşılabilir.',
      'Yurt dışına aktarım söz konusuysa KVKK m. 9 hükümlerine uygun güvenceler (açık rıza, yeterlilik kararı veya taahhütname) sağlanır.',
      'Kişisel verileriniz reklam amaçlı üçüncü taraflara satılmaz.',
    ],
  },
  {
    id: 'retention',
    title: '7. Saklama Süreleri ve Silme',
    paragraphs: [
      'Verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuattaki zamanaşımı süreleri kadar saklanır.',
      'Hesap kapatıldığında, yasal saklama zorunluluğu bulunmayan veriler makul süre içinde silinir veya anonimleştirilir.',
      `Google ile giriş verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızın ve ilişkili Google profil verilerinin silinmesini ${LEGAL_META.contactEmail} adresinden talep edebilirsiniz.`,
    ],
  },
  {
    id: 'rights',
    title: '8. KVKK Kapsamındaki Haklarınız',
    paragraphs: ['KVKK m. 11 uyarınca aşağıdaki haklara sahipsiniz:'],
    bullets: [
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
      'İşlenmişse buna ilişkin bilgi talep etme',
      'İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme',
      'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
      'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
      'KVKK m. 7 kapsamında silinmesini veya yok edilmesini isteme',
      'Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme',
      'Münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
      'Kanuna aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme',
    ],
  },
  {
    id: 'cookies',
    title: '9. Çerezler ve Yerel Depolama',
    paragraphs: [
      'Oturum yönetimi, tercihlerinizin hatırlanması ve güvenlik için çerezler ve tarayıcı yerel depolaması kullanılır.',
      'Zorunlu çerezler hizmetin çalışması için gereklidir. Analitik veya pazarlama çerezleri varsa açık rızanız alınır.',
      'Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; bazı çerezleri devre dışı bırakmak hizmeti kısıtlayabilir.',
    ],
  },
  {
    id: 'security',
    title: '10. Güvenlik',
    paragraphs: [
      'Verilerinizin korunması için şifreleme, erişim kontrolü ve güvenli sunucu altyapısı gibi teknik ve idari tedbirler uygulanır.',
      'Hiçbir sistem %100 güvenli değildir; şüpheli bir durum fark ederseniz derhal bizimle iletişime geçin.',
    ],
  },
  {
    id: 'children',
    title: '11. Çocukların Gizliliği',
    paragraphs: [
      'Platform 18 yaş altındaki kişilere yönelik değildir. Bilerek 18 yaş altından kişisel veri toplanmaz.',
      'Ebeveyn veya veli iseniz ve çocuğunuzun veri paylaştığını düşünüyorsanız bizimle iletişime geçin.',
    ],
  },
  {
    id: 'updates',
    title: '12. Politika Güncellemeleri',
    paragraphs: [
      'Bu politika güncellenebilir. Güncel metin her zaman Platform üzerinde yayımlanır.',
      `Son güncelleme: ${LEGAL_META.lastUpdated}. Başvurularınızı ${LEGAL_META.contactEmail} adresine iletebilirsiniz.`,
    ],
  },
];
