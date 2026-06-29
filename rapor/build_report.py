from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import datetime
import json

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image as RLImage,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(r"C:\Users\ASUS\Pictures\nesvenext\loyalty")
PROJECT = ROOT / "project"
OUT = ROOT / "rapor"
FRAME_DIR = OUT / "phone_frames"
OUT.mkdir(exist_ok=True)
FRAME_DIR.mkdir(parents=True, exist_ok=True)


def setup_fonts() -> tuple[str, str]:
    regular = Path(r"C:\Windows\Fonts\arial.ttf")
    bold = Path(r"C:\Windows\Fonts\arialbd.ttf")
    if regular.exists():
        pdfmetrics.registerFont(TTFont("ReportSans", str(regular)))
        pdfmetrics.registerFont(TTFont("ReportSansBold", str(bold if bold.exists() else regular)))
        return "ReportSans", "ReportSansBold"
    return "Helvetica", "Helvetica-Bold"


BASE_FONT, BOLD_FONT = setup_fonts()
PKG = json.loads((PROJECT / "package.json").read_text(encoding="utf-8"))


def make_phone_frame(src: Path, label: str) -> Path:
    img = Image.open(src).convert("RGB")
    w, h = 520, 980
    screen_box = (42, 74, w - 42, h - 72)
    sw, sh = screen_box[2] - screen_box[0], screen_box[3] - screen_box[1]
    ratio = max(sw / img.width, sh / img.height)
    resized = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - sw) // 2)
    top = max(0, (resized.height - sh) // 2)
    screen = resized.crop((left, top, left + sw, top + sh))

    canvas = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((24, 28, w - 24, h - 24), radius=58, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    canvas.alpha_composite(shadow, (0, 10))

    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((22, 22, w - 22, h - 28), radius=60, fill=(12, 5, 24, 255), outline=(0, 0, 0, 255), width=5)
    d.rounded_rectangle((screen_box[0] - 6, screen_box[1] - 6, screen_box[2] + 6, screen_box[3] + 6), radius=42, fill=(0, 0, 0, 255))

    mask = Image.new("L", (sw, sh), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, sw, sh), radius=36, fill=255)
    canvas.paste(screen, (screen_box[0], screen_box[1]), mask)

    d.rounded_rectangle((w // 2 - 42, 45, w // 2 + 42, 55), radius=5, fill=(42, 25, 58, 255))
    d.ellipse((w // 2 + 58, 42, w // 2 + 72, 56), fill=(34, 20, 45, 255))

    caption_font = None
    try:
        from PIL import ImageFont

        caption_font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 18)
    except Exception:
        pass
    d.rounded_rectangle((72, h - 58, w - 72, h - 34), radius=12, fill=(255, 255, 255, 230))
    d.text((w // 2, h - 54), label, anchor="ma", fill=(30, 16, 48, 255), font=caption_font)

    out = FRAME_DIR / f"{src.stem}_phone.png"
    canvas.convert("RGB").save(out, quality=92)
    return out


styles = getSampleStyleSheet()
styles.add(ParagraphStyle("TitleBig", fontName=BOLD_FONT, fontSize=28, leading=34, alignment=TA_CENTER, textColor=colors.HexColor("#25103A"), spaceAfter=12))
styles.add(ParagraphStyle("SubtitleTR", fontName=BASE_FONT, fontSize=12, leading=17, alignment=TA_CENTER, textColor=colors.HexColor("#4B3B5F"), spaceAfter=24))
styles.add(ParagraphStyle("H1", fontName=BOLD_FONT, fontSize=18, leading=23, textColor=colors.HexColor("#25103A"), spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle("H2", fontName=BOLD_FONT, fontSize=14, leading=18, textColor=colors.HexColor("#6D28D9"), spaceBefore=10, spaceAfter=6))
styles.add(ParagraphStyle("BodyTR", fontName=BASE_FONT, fontSize=9.2, leading=13.2, textColor=colors.HexColor("#1D1730"), spaceAfter=6))
styles.add(ParagraphStyle("BulletTR", fontName=BASE_FONT, fontSize=9, leading=12.6, leftIndent=12, firstLineIndent=-8, textColor=colors.HexColor("#1D1730"), spaceAfter=3))
styles.add(ParagraphStyle("CaptionTR", fontName=BOLD_FONT, fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.HexColor("#4B246D"), spaceBefore=4, spaceAfter=10))
styles.add(ParagraphStyle("NoteTR", fontName=BASE_FONT, fontSize=9, leading=13, textColor=colors.HexColor("#22122E")))
styles.add(ParagraphStyle("TableHeadTR", fontName=BOLD_FONT, fontSize=8.5, leading=11, textColor=colors.white))
styles.add(ParagraphStyle("TableCellTR", fontName=BASE_FONT, fontSize=8, leading=10.5, textColor=colors.HexColor("#1D1730")))


def P(text: str) -> Paragraph:
    return Paragraph(text, styles["BodyTR"])


def H1(text: str) -> Paragraph:
    return Paragraph(text, styles["H1"])


def H2(text: str) -> Paragraph:
    return Paragraph(text, styles["H2"])


def bullets(items: list[str]) -> list[Paragraph]:
    return [Paragraph(f"• {item}", styles["BulletTR"]) for item in items]


def note(title: str, body: str) -> Table:
    return Table(
        [[Paragraph(f"<b>{title}</b><br/>{body}", styles["NoteTR"])]],
        colWidths=[16.2 * cm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3EAFF")),
                ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#4B246D")),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        ),
    )


def add_section(story: list, title: str, items: list[str]) -> None:
    story.append(H2(title))
    story.extend(bullets(items))


def table_cell(text: str, head: bool = False) -> Paragraph:
    return Paragraph(text, styles["TableHeadTR" if head else "TableCellTR"])


def build_report() -> Path:
    image_sources = [
        ("Karşılama / Landing", ROOT / "screenshots" / "02_landing_full.jpg"),
        ("Giriş Ekranı", ROOT / "screenshots" / "03_login.jpg"),
        ("Kayıt Ekranı", ROOT / "screenshots" / "04_register.jpg"),
        ("Kullanıcı Ana Sayfa", OUT / "screenshots" / "live" / "02_ana_sayfa.png"),
        ("Ödül Mağazası", OUT / "screenshots" / "live" / "03_magaza.png"),
        ("Envanter ve Biletler", OUT / "screenshots" / "live" / "04_envanter.png"),
        ("QR Tarayıcı", OUT / "screenshots" / "live" / "05_qr.png"),
        ("Liderlik ve Etkinlik", OUT / "screenshots" / "live" / "06_liderlik.png"),
        ("Mini Oyunlar", OUT / "screenshots" / "live" / "07_oyunlar.png"),
        ("Profil", OUT / "screenshots" / "live" / "01_profil.png"),
        ("Admin Dashboard", ROOT / "screenshots" / "06_admin_dashboard.jpg"),
        ("Admin Analitik", ROOT / "screenshots" / "10_admin_analytics.jpg"),
    ]
    frames = [(label, make_phone_frame(src, label)) for label, src in image_sources if src.exists()]
    now = datetime.datetime.now().strftime("%d.%m.%Y %H:%M")

    story: list = []
    story += [
        Spacer(1, 1.2 * cm),
        Paragraph("NEŞVENEXT", styles["TitleBig"]),
        Paragraph("Sadakat, Ödül, QR ve Yönetim Platformu - Türkçe Kapsamlı Ürün ve Teknik Rapor", styles["SubtitleTR"]),
        note(
            "Rapor kapsamı",
            f"Bu rapor {now} tarihinde proje kaynak kodu, Supabase migration dosyaları, servis katmanı ve mevcut uygulama ekran görüntüleri incelenerek hazırlanmıştır.",
        ),
        Spacer(1, 0.4 * cm),
    ]
    if len(frames) > 3:
        story += [RLImage(str(frames[3][1]), width=7.3 * cm, height=13.8 * cm), Paragraph("Telefon çerçeveli örnek uygulama görünümü", styles["CaptionTR"])]
    story.append(PageBreak())

    story += [H1("1. Yönetici Özeti")]
    story.append(P("NeşveNext, müşterilerin alışveriş, QR kod, günlük giriş, mini oyun, görev ve etkinliklerden puan kazandığı; bu puanları ödül bileti ve kuponlara dönüştürdüğü bir sadakat platformudur. Sistem; kullanıcı uygulaması, kasiyer paneli, mağaza/admin yönetimi, gerçek zamanlı liderlik ve Supabase tabanlı güvenli iş mantığından oluşur."))
    story.extend(bullets([
        "Kullanıcılar puan kazanır, XP ve seviye ilerlemesi yaşar, ödül mağazasından bilet alır ve envanterde QR/kod olarak gösterir.",
        "Kasiyerler alışveriş tutarına göre tek kullanımlık QR oluşturur ve müşterinin bilet/kupon kodunu manuel veya QR tarama ile teslim eder.",
        "Adminler kullanıcı, ödül, envanter, QR, günlük ödül, oyun, bildirim, etkinlik, puan ekonomisi ve genel ayarları yönetir.",
        "Supabase RLS, server-side RPC, role checks, tek kullanımlık QR ve bilet süre kontrolleri ile kötüye kullanım azaltılır.",
        "UI dili neo-brutalism + iPhone app hissi: kalın sınırlar, yuvarlatılmış kartlar, sticker görseller, büyük aksiyonlar ve mobil öncelikli akış.",
    ]))

    story += [H1("2. Kullanılan Teknolojiler")]
    add_section(story, "Frontend", [
        f"React {PKG['dependencies'].get('react')} ve React DOM {PKG['dependencies'].get('react-dom')}: bileşen tabanlı kullanıcı arayüzü.",
        f"Vite {PKG['devDependencies'].get('vite')}: hızlı geliştirme, optimize production build ve modern bundle çıktısı.",
        f"TypeScript {PKG['devDependencies'].get('typescript')}: tip güvenliği ve daha kontrollü servis katmanı.",
        f"React Router DOM {PKG['dependencies'].get('react-router-dom')}: HashRouter ile route yönetimi.",
        f"TanStack React Query {PKG['dependencies'].get('@tanstack/react-query')}: cache, invalidation ve veri yenileme.",
        "Lucide React, Recharts, ZXing, jsQR, qrcode, lokal fontlar ve responsive CSS sistemi.",
    ])
    add_section(story, "Backend ve Veritabanı", [
        f"Supabase JS {PKG['dependencies'].get('@supabase/supabase-js')}: Auth, PostgREST, Realtime ve Edge Functions bağlantısı.",
        "Supabase Auth: e-posta/şifre, Google OAuth, PKCE flow ve session persistence.",
        "PostgreSQL tabloları: profiles, rewards, redemptions, qr_codes, qr_scans, points_transactions, app_settings, games_config, daily_reward_config, event_participants.",
        "Security definer RPC fonksiyonları: claim_qr_scan, preview_qr_scan, purchase_reward, claim_daily_streak, lookup_redemption_by_code, mark_redemption_used_by_code, create_cashier_qr.",
        "Supabase Realtime: profil, puan, leaderboard ve envanter güncellemelerinde canlı yenileme.",
    ])
    add_section(story, "Deployment ve Operasyon", [
        "Vercel deployment: Vite dist çıktısı ve project/vercel.json ayarı.",
        "Environment değişkenleri: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY veya VITE_SUPABASE_PUBLISHABLE_KEY.",
        "Sentry entegrasyonu: production hata izleme için @sentry/react.",
        "Service worker, public headers, sitemap ve robots dosyaları.",
    ])

    story += [H1("3. Roller ve Yetki Mantığı")]
    story.append(P("Sistem rolleri public.profiles.role alanından okunur. Frontend role değerine körü körüne güvenilmez; kritik işlemler Supabase RLS ve RPC içinde tekrar doğrulanır."))
    role_table = [
        [table_cell("Rol", True), table_cell("Erişim", True), table_cell("Örnek İşlemler", True)],
        [table_cell("customer"), table_cell("Kullanıcı uygulaması"), table_cell("Puan kazanma, mağaza, envanter, QR tarama, oyun, profil, destek")],
        [table_cell("cashier"), table_cell("Kasa paneli"), table_cell("Alışveriş QR üretme, bilet/kupon sorgulama ve tek kullanımlık teslim")],
        [table_cell("store_admin"), table_cell("Mağaza yönetimi"), table_cell("Mağaza ürünleri, QR, müşteri ve promosyon yönetimi")],
        [table_cell("super_admin"), table_cell("Tam admin paneli"), table_cell("Kullanıcılar, ekonomi, ayarlar, günlük ödüller, oyunlar, etkinlikler, loglar")],
    ]
    story.append(Table(role_table, colWidths=[3.2 * cm, 4.2 * cm, 8.8 * cm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6D28D9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7C6F3")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])))
    story += [Spacer(1, 0.2 * cm), note("Önemli güvenlik yaklaşımı", "Admin, kasiyer ve mağaza yönetimi route guard ile gizlenir; ancak asıl güvenlik veritabanındaki RLS/RPC katmanındadır. Kullanıcı frontend üzerinden rol değiştirerek kritik işlemleri geçemez.")]

    story += [H1("4. Kullanıcı Sayfaları ve Özellikleri")]
    for title, items in [
        ("Landing / Karşılama", ["SEO odaklı tanıtım alanı, CTA butonları, kullanıcı yorumları, avantajlar ve marka sticker dili.", "Giriş ve ücretsiz kayıt yönlendirmeleri.", "Açık/koyu tema ve mobil uyumlu hero tasarım."]),
        ("Login / Register", ["E-posta/şifre ve Google OAuth giriş/kayıt.", "KVKK, Kullanım Şartları ve Gizlilik Politikası kabul akışı.", "PKCE auth callback; HashRouter uyumlu redirect.", "Yasaklı/silinmiş hesaplarda otomatik çıkış ve uyarı."]),
        ("Ana Sayfa", ["Puan bakiyesi, XP, seviye ilerlemesi ve level-up animasyonu.", "Sadakat limiti göstergesi: 75% üstünde Türkçe uyarı; limit dolunca büyük engel mesajı.", "Sıralama ve envanter kısa kartları, hızlı işlem kartları ve günlük giriş ödülü.", "Admin günlük ödülü pasif yaparsa kullanıcıya gösterilmez."]),
        ("Ödül Mağazası", ["Supabase rewards tablosundan ürün listesi.", "Stok, sınırlı ürün, yetersiz puan, satın alınabilir ürün filtreleri.", "purchase_reward RPC ile atomik satın alma: puan düşer, bilet üretilir, stok azalır.", "Lazy image, decode async ve code-splitting ile scroll performansı."]),
        ("Envanter", ["Aktif, kullanılmış ve süresi dolmuş biletler.", "Bilet detayında QR ve kısa kod.", "expires_at üzerinden gerçek kalan süre ve progress bar.", "Kullanılan/expired bilet tekrar kullanılamaz."]),
        ("QR Tarayıcı", ["Kamera ile QR okuma ve manuel kod girişi.", "preview_qr_scan ile güvenli önizleme; claim_qr_scan ile tek kullanımlık claim.", "Manuel QR kodlar da tarama ile aynı backend doğrulamasından geçer.", "Limit, expiry, active, max_uses ve already_scanned kontrolleri server tarafında."]),
        ("Liderlik", ["Tüm zamanlar sıralaması, Top 3 podium ve liste sıralaması.", "Etkinlik liderliği: join_event sonrası event_participants tablosu.", "Gün/saat/dakika/saniye countdown ve ödül havuzu.", "Realtime sinyallerle kontrollü yenileme."]),
        ("Mini Oyunlar", ["Admin games_config üzerinden güncellenen oyun listesi.", "Tekrarlanan oyunları temizleyen DB/config mantığı.", "Oyun puan aralıkları, enabled/disabled durumu.", "Level-up animasyonu, ses ve partikül deneyimi."]),
        ("Profil ve Ayarlar", ["Kullanıcı bilgileri, toplam puan, başarı, mevcut puan, quick actions.", "Avatar editor: seed, ten rengi, gözlük varyantları.", "Kötü/+18 kelime uyarısı: profil kaydı kabul edilmez veya uyarılır.", "Bildirimler, geçmiş, gizlilik, şifre değiştirme, destek ve istatistik sayfaları."]),
    ]:
        add_section(story, title, items)

    story += [H1("5. Admin, Mağaza Admin ve Kasiyer Özellikleri")]
    for title, items in [
        ("Süper Admin Dashboard", ["Genel KPI kartları: kullanıcı, puan, ödül, QR, risk ve büyüme metrikleri.", "Panel V2, analitik grafikler, son aktiviteler ve sistem sağlığı.", "Mobil sidebar, tema ve güvenli çıkış."]),
        ("Kullanıcı Yönetimi", ["Profiles tablosundan kullanıcı listesi, arama, filtre ve detay.", "Puan hareketleri, rozet/görev/QR/envanter özetleri.", "Ban/unban ve hesap durumu işlemleri backend kontrolüyle."]),
        ("Rol Yönetimi", ["Rol işlemleri kullanıcı yönetimi içinde yürür.", "public.profiles.role kaynak alınır; metadata role bilgisine güvenilmez.", "Süper admin dışındaki rol yükseltmeleri RLS/RPC ile engellenir."]),
        ("Ödül / Ürün Mağazası Yönetimi", ["rewards tablosuna bağlı ürün CRUD.", "Başlık, açıklama, puan, stok, kategori, görsel, limited/featured/active kontrolü.", "Admin update RLS/policy ile korunur."]),
        ("Ödül Etkinlikleri", ["Etkinlik oluşturma, banner rengi, tarih aralığı, prize slotları ve winner dağıtımı.", "Inclusive bitiş tarihi ve canlı countdown.", "Kazananlar event puanına göre belirlenir."]),
        ("QR & Kod Yöneticisi", ["qr_codes tablosuna bağlı satın alma QRları, mağaza kodları ve envanter kodları.", "Aktif/pasif, tek kullanımlık, kullanım sayısı, süresi ve kod kopyalama.", "admin_create_store_qr ve create_cashier_qr güvenli RPC akışları."]),
        ("Admin Envanter Yönetimi", ["Kullanıcı seçimi ve redemptions kayıtlarını görüntüleme.", "Öğe ekleme, güncelleme, kullanıldı işaretleme, QR/kod gösterme.", "Süreli bilet ve kullanılmış bilet ayrımı."]),
        ("Günlük Giriş Ödülleri", ["daily_reward_config tablosundan 7 günlük takvim.", "Gün bazlı puan, özel gün, enabled/pasif kontrolü.", "claim_daily_streak RPC backend validation yapar."]),
        ("Oyun Yönetimi", ["games_config tablosundan oyun listesi.", "Oyun adı, açıklama, ikon, renk, max plays/day, max points/play ve enabled ayarı.", "Kullanıcı oyun sayfası admin değişikliklerini Supabase üzerinden görür."]),
        ("Puan Ekonomisi ve Loyalty Settings", ["Maksimum puan limiti varsayılan 1200.", "Puan limitini aç/kapat, max limit, ticket valid for ve unit dakika/saat/gün.", "Backend claim kontrolü: limit, current_points, expiry, enabled setting."]),
        ("Bildirim, E-posta ve Destek", ["Admin bildirim gönderimi, email Edge Function altyapısı.", "Push subscription kayıtları ve service worker.", "Support ticket listesi ve cevap/işlem akışı."]),
        ("Kasiyer Paneli", ["Alışveriş tutarından kazanılacak puanı hesaplar.", "Tek kullanımlık QR üretir; süreli, max_uses=1 ve cashier QR mantığı.", "Bilet/kupon kodunu manuel veya QR tarayıcı ile sorgular ve teslim eder.", "Kullanılmış/expired bilet tekrar kullanılamaz."]),
        ("Mağaza Admin Paneli", ["Mağaza dashboard, ürünler, rewards, inventory, promosyonlar, müşteriler, QR, bildirim ve analytics.", "Store admin rolü full super_admin panelinden ayrıştırılmıştır."]),
    ]:
        add_section(story, title, items)

    story += [H1("6. İş Mantığı")]
    for title, desc in [
        ("Puan Kazanma", "Kullanıcı QR, günlük giriş, görev, oyun, achievement ve referral gibi aksiyonlardan puan kazanır. Frontend yalnızca aksiyon veya kod gönderir; gerçek puan hesabı RPC tarafında yapılır."),
        ("XP ve Seviye", "Puan/aksiyon sonrası XP hesaplanır; level_config ve profile alanları kullanılarak seviye ilerlemesi güncellenir. Seviye artışında büyük overlay, ses, animasyon ve partikül deneyimi gösterilir."),
        ("Ödül Satın Alma", "purchase_reward reward kaydını kilitler, kullanıcının puanını kontrol eder, puanı düşer, redemptions kaydı ve benzersiz kısa kod üretir, stok azaltır ve expires_at belirler."),
        ("Bilet Kullanımı", "Kasiyer lookup_redemption_by_code ile bilgiyi görür, mark_redemption_used_by_code ile atomik olarak used=true ve used_at set eder. Expired veya used bilet reddedilir."),
        ("QR Claim", "claim_qr_scan kodu normalize eder, aktiflik/süre/max use/already scanned kontrolü yapar, puanı işler, qr_scans kaydı oluşturur."),
        ("Sadakat Limiti", "points_limit_enabled aktifse max_points_limit aşımı backendde engellenir. 75% altında kart gizli; 75% üstünde uyarı; 100% sonrası claim blok mesajı."),
        ("Günlük Ödül", "daily_reward_config günlerine göre ödül hesaplanır. Aynı gün tekrar claim engellenir, seri günleri takip edilir, disabled config kullanıcıya kapatılır."),
        ("Etkinlik Sıralaması", "Kullanıcı evente katıldıktan sonra event_participants üzerinden event puanı hesaplanır. get_event_leaderboard limitli veri döndürür ve realtime sinyallerle yenilenir."),
    ]:
        story += [H2(title), P(desc)]

    story += [H1("7. Güvenlik Raporu")]
    for title, desc in [
        ("SQL Injection", "Frontend Supabase query builder ve RPC parametreleri kullanıyor; string birleştirme ile SQL çalıştırma yok. Kritik SQL fonksiyonlarında p_code, p_reward_id, p_user_id gibi parametreler kullanılıyor."),
        ("RLS", "profiles, redemptions, qr_codes, qr_scans, app_settings, daily_reward_config, games_config gibi tablolar RLS politikaları ile ayrılıyor."),
        ("Service Role Güvenliği", "Frontend yalnızca anon/publishable key kullanır. Service role gerektiren işler Supabase Edge Function veya security definer RPC tarafında kalır."),
        ("Rol ve Privilege Escalation", "Rol public.profiles.role alanından okunur. protect_profile_privileged_fields triggerı normal kullanıcıların role/status gibi ayrıcalıklı alanları doğrudan güncellemesini engeller."),
        ("QR Replay ve Double Spending", "qr_scans kaydı, max_uses, uses_count, expires_at ve already scanned kontrolü ile QR tekrar kullanımı engellenir."),
        ("Bilet Double Spending", "redemptions.used, used_at, expires_at ve mark_redemption_used_by_code atomik update ile aynı biletin ikinci kez teslimini engeller."),
        ("XSS", "React default escaping kullanır. Kullanıcı metinleri JSX içinde düz text olarak render edilir; kritik kullanıcı alanlarında raw HTML yaklaşımı kullanılmaz."),
        ("IDOR", "Kullanıcıya ait verilerde user_id = auth.uid() RLS yaklaşımı; cashier/admin çapraz erişimler ise role check yapan RPC ile sınırlandırılır."),
        ("Auth Redirect", "PKCE flow, authCallbackUrl ve HashRouter uyumu kullanılır. Google OAuth redirect Supabase provider üzerinden yürür."),
        ("Kötü/+18 İçerik", "profile_has_adult_content ve moderate_profile_adult_content migrationı +18 kelimeleri yakalar; profil kaydında uyarı/engelleme mantığı vardır."),
        ("LocalStorage / Session", "Supabase auth session persist eder; logout sırasında sb-* localStorage anahtarları temizlenir. Rol değeri localStoragedan değil DB profilden alınır."),
        ("Rate ve Döngü Kontrolü", "Event leaderboard RPC çağrılarında loading guard/cache mantığı ve subscription cleanup yaklaşımı tekrar eden istekleri engellemek için uygulanmıştır."),
    ]:
        story += [H2(title), P(desc)]

    story += [H1("8. Sayfa Görselleri")]
    for idx, (label, frame) in enumerate(frames, 1):
        story.append(KeepTogether([H2(f"Görsel {idx}: {label}"), RLImage(str(frame), width=6.7 * cm, height=12.6 * cm), Paragraph(label, styles["CaptionTR"])]))
        if idx in (2, 4, 6, 8, 10):
            story.append(PageBreak())

    story += [H1("9. Teknik Dosya Haritası")]
    tech_table = [
        [table_cell("Alan", True), table_cell("Dosyalar / Klasörler", True), table_cell("Açıklama", True)],
        [table_cell("Route ve shell"), table_cell("src/App.tsx, src/components/Layout.tsx"), table_cell("Public, customer, admin, store-admin ve cashier route ayrımı.")],
        [table_cell("Auth"), table_cell("src/context/AuthContext.tsx, src/lib/supabase.ts"), table_cell("Session, profile role fetch, Google OAuth, logout cleanup.")],
        [table_cell("Puan/claim"), table_cell("src/services/earn.ts, src/services/points.ts"), table_cell("perform_action, claim_qr_scan, claim_daily_streak, leaderboard refresh.")],
        [table_cell("Ödül/envanter"), table_cell("src/services/rewards.ts, src/services/redemptions.ts, src/context/InventoryContext.tsx"), table_cell("Reward CRUD, satın alma, redemptions, realtime envanter.")],
        [table_cell("Admin"), table_cell("src/pages/admin/*, src/services/admin.ts"), table_cell("Dashboard, kullanıcılar, rewards, QR, inventory, günlük ödül, ayarlar.")],
        [table_cell("Kasiyer"), table_cell("src/pages/admin/cashier/*"), table_cell("QR üretme, ticket redeem, geçmiş ve kasa akışı.")],
        [table_cell("DB güvenliği"), table_cell("supabase/migrations/*.sql"), table_cell("RLS, RPC, triggers, claim limit, ticket timer, event ranking.")],
    ]
    story.append(Table(tech_table, colWidths=[3.2 * cm, 5.4 * cm, 7.6 * cm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#CBC2D9")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])))

    story += [H1("10. Mevcut Route Listesi")]
    routes = ["/", "/landing", "/login", "/register", "/auth/callback", "/app", "/home", "/profile", "/inventory", "/shop", "/games", "/progress", "/qr", "/achievements", "/missions", "/notifications", "/history", "/settings", "/settings/edit-profile", "/settings/privacy", "/settings/change-password", "/support", "/support/live-chat", "/support/email", "/support/call", "/events", "/leaderboard", "/stats", "/admin", "/admin/dashboard-v2", "/admin/analytics", "/admin/users", "/admin/rewards", "/admin/reward-events", "/admin/events", "/admin/notifications", "/admin/inventory", "/admin/checkout", "/admin/qr", "/admin/games", "/admin/missions", "/admin/daily-rewards", "/admin/points-economy", "/admin/audit-logs", "/admin/settings", "/admin/support", "/store-admin", "/store-admin/items", "/store-admin/rewards", "/store-admin/inventory", "/store-admin/promotions", "/store-admin/customers", "/store-admin/qr", "/store-admin/notifications", "/store-admin/analytics", "/cashier", "/cashier/scan", "/cashier/redeem", "/cashier/history"]
    story.append(P(", ".join(routes)))

    story += [H1("11. Kabul Kriterleri ve Son Kontrol Listesi")]
    story.extend(bullets([
        "Kullanıcı puan claim akışları server-side RPC ile doğrulanır.",
        "Maksimum sadakat limiti ve ticket geçerlilik süresi admin ayarlarından yönetilebilir.",
        "Expired ticket kullanıcı ve kasiyer akışında kullanılamaz.",
        "QR ve bilet kodları tek kullanımlık/replay korumalıdır.",
        "Admin/kasiyer yetkileri frontend rolüne değil Supabase role/RLS/RPC doğrulamasına dayanır.",
        "Kullanıcı dashboardu limit yakınlığını Türkçe ve 75% üstünde gösterir.",
        "Günlük ödül admin pasif olduğunda kullanıcı sayfasında görünmez.",
        "Oyun, QR, inventory, rewards ve daily reward sayfaları Supabase verisine bağlıdır.",
        "Google OAuth ve e-posta auth PKCE/HashRouter uyumlu çalışır.",
        "Production build Vite dist üretir; Vercel outputDirectory project/dist olarak ayarlanır.",
    ]))

    story += [H1("12. Önerilen Sonraki İyileştirmeler")]
    story.extend(bullets([
        "Admin ekranları için ayrı e2e smoke test: super_admin, cashier ve customer rolleriyle route erişimi kontrolü.",
        "QR claim ve ticket redeem fonksiyonları için pgTAP veya Supabase SQL test seti.",
        "Store page ürün gridinde virtualization veya viewport bazlı image priority ile daha da akıcı scroll.",
        "Kötü kelime filtresinin Türkçe/İngilizce varyasyonları ve normalize edilmiş karakter eşlemeleriyle genişletilmesi.",
        "Audit log panelinde yüksek riskli işlem bildirimleri ve admin değişiklik geçmişi exportu.",
        "Raporun şirket sunumu için Canva/PPT versiyonu.",
    ]))

    pdf_path = OUT / "nesvenext_turkce_kapsamli_rapor.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, rightMargin=1.7 * cm, leftMargin=1.7 * cm, topMargin=1.6 * cm, bottomMargin=1.5 * cm)

    def header_footer(canvas, doc_obj):
        canvas.saveState()
        canvas.setFont(BASE_FONT, 7.5)
        canvas.setFillColor(colors.HexColor("#6B5A7D"))
        canvas.drawString(1.7 * cm, 1.0 * cm, "NEŞVENEXT - Sadakat Platformu Türkçe Rapor")
        canvas.drawRightString(A4[0] - 1.7 * cm, 1.0 * cm, f"Sayfa {doc_obj.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)

    readme = f"""# NEŞVENEXT Türkçe Kapsamlı Rapor

Oluşturma tarihi: {now}

Bu klasörde PDF rapor ve telefon çerçeveli ekran görüntüleri bulunur.

## Teslimatlar

- `nesvenext_turkce_kapsamli_rapor.pdf`: Ana Türkçe rapor.
- `phone_frames/`: Raporda kullanılan telefon çerçeveli görseller.
- `screenshots/live/`: Canlı uygulamadan yakalanan ham ekran görüntüleri.

## Kapsam

Rapor; kullanıcı sayfaları, admin paneli, mağaza admin paneli, kasiyer paneli, Supabase güvenliği, RLS/RPC mantığı, QR ve bilet akışı, günlük ödül, oyun yönetimi, sadakat puan limiti, +18/kötü kelime kontrolü, performans ve deployment başlıklarını içerir.

## Not

Canlı oturumda admin ve kasiyer route'ları yetki nedeniyle `unauthorized` ekranına yönlendi. Bu durum raporda güvenlik davranışı olarak notlanmıştır. Admin görselleri için repodaki mevcut gerçek ekran görüntüleri kullanılmıştır.
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")
    return pdf_path


if __name__ == "__main__":
    print(build_report())
