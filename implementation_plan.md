# Subscription UX & Plan Management Implementation

This plan covers the UI updates for active subscribers, plan limit enforcements, and subscription cancellation logic.

## User Review Required
> [!IMPORTANT]
> Bu aşamada sitenin "kullanıcı deneyimini" (UX) abonelere göre özelleştireceğiz. Ayrıca iptal işlemleri için veri tabanına ufak bir eklenti yapmamız gerekiyor. Lütfen aşağıdaki planı oku ve onay ver.

## Proposed Changes

### 1. Database & Webhook Update (İptal İşlemleri İçin)
Müşterilerin aboneliklerini iptal edebilmesi için LemonSqueezy'nin bize verdiği "Müşteri Yönetim Paneli" (Customer Portal) linkini veya "Abonelik ID"sini veri tabanına kaydetmemiz gerekiyor.
- **[MODIFY]** `supabase/migrations/` içine yeni bir dosya ekleyip `organizations` tablosuna `billing_portal_url` sütunu ekleyeceğim.
- **[MODIFY]** `src/app/api/webhooks/lemonsqueezy/route.ts`: Webhook artık sadece paketi değil, müşterinin iptal/yönetim linkini de veri tabanına kaydedecek. İptal işlemi geldiğinde paketi tekrar `free` yapacak.

### 2. Homepage (Ana Sayfa) UI
- **[MODIFY]** `src/app/page.tsx` (veya Hero componenti): Eğer siteye giren kişi giriş yapmışsa ve paketi `free` DEĞİLSE (yani Radar veya Command almışsa), "Start free" butonu gizlenecek. Sadece "See how it works" veya "Go to Dashboard" butonu kalacak.

### 3. Pricing (Fiyatlandırma) Sayfası UI
Kullanıcının mevcut paketine göre fiyatlandırma sayfası şekil değiştirecek:
- **[MODIFY]** `src/app/pricing/page.tsx`:
  - **Radar alanlar için:** Fiyat kartları gizlenecek. Sadece "Şu anda Radar paketine sahipsiniz." yazacak. (Şu anlık paket yükseltme kapalı olacak).
  - **Command alanlar için:** "Zaten en iyi pakete sahipsiniz (Command)." yazacak.
  - **İptal edenler (veya Free olanlar) için:** Sayfa eski standart haline (iki kartın da göründüğü tasarıma) geri dönecek.

### 4. Profile / Settings (İptal Butonu)
- **[MODIFY]** Profil ayarları sayfasına (veya Dashboard'da uygun bir yere) **"Aboneliği Yönet / İptal Et"** butonu eklenecek.
- Bu butona basan müşteri, doğrudan LemonSqueezy'nin iptal ekranına (fatura indirme, kart değiştirme, iptal etme) gidecek. Söylediğin gibi para iadesi vb. olmayacak, sadece abonelik iptal edilecek.

### 5. Plan Limitleri (Enforcement)
- Zaten arka planda veri tabanımızda limitler tanımlı. `free`, `radar` ve `command` için geçerli olan kullanım hakları otomatik olarak devreye girecek. (Ücretsizler sadece deneme yapabilecek).

## Verification Plan
1. Yeni bir test satınalması yapacağız.
2. Ana sayfada "Start free" butonunun kaybolduğunu göreceğiz.
3. Pricing sayfasına girip "Şu an bu pakettesiniz" uyarısını göreceğiz.
4. Profil'den "İptal et" tuşuna basıp iptal senaryosunu test edeceğiz.
