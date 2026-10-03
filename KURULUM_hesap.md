# Hesap sistemi (v7): Firebase kurulumu, adım adım

Süre yaklaşık 15–20 dakika, yalnız bir kez yapılır. Menü adları aşağıda İngilizce yazıyor. Firebase konsolu Türkçe ya da Almanca açılırsa adlar biraz farklı olabilir, ama yerleri aynıdır.

**Ücret:** Ücretsiz **Spark** planı kullanılıyor, ödeme bilgisi istenmez. Firebase bir yerde **"Upgrade"** ya da **"Blaze"** önerirse **geçme**.

---

## Adım 1: Firebase projesini oluştur

1. Tarayıcıda **https://console.firebase.google.com** adresini aç ve Google hesabınla giriş yap.
2. **"Create a project"** (ya da "Get started with a Firebase project") düğmesine tıkla.
3. **Project name:** `prog-rock-atlas` yaz.
   - Altında bir proje kimliği önerilir (ör. `prog-rock-atlas-1a2b3`). Sonradan değiştirilemez ama önemi yok, olduğu gibi bırak.
4. Koşulları kabul eden kutuyu işaretle → **Continue**.
5. **Gemini in Firebase** (yapay zekâ yardımı) sorulursa kapalı bırak → **Continue**.
6. **Google Analytics** sorulursa düğmeyi **kapat** (gizlilik metninde "analiz yok" diyoruz) → **Create project**.
7. Birkaç saniye bekle → **Continue**. Projenin ana sayfası (Project Overview) açılır.

## Adım 2: Web uygulamasını kaydet ve ayar değerlerini al

1. Project Overview sayfasının ortasında platform simgeleri var: iOS, Android ve **`</>`** (Web). **`</>`** simgesine tıkla.
   - Simgeyi göremiyorsan: sol üstteki dişli ⚙ → **Project settings** → aşağıda "Your apps" → **`</>`**.
2. **App nickname:** `atlas-web` yaz.
3. **"Also set up Firebase Hosting"** kutusunu **işaretleme**, site GitHub'da kalıyor.
4. **Register app** düğmesine tıkla.
5. Ekranda şuna benzer bir kod çıkar:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "prog-rock-atlas.firebaseapp.com",
     projectId: "prog-rock-atlas",
     storageBucket: "prog-rock-atlas.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123..."
   };
   ```

   Süslü parantezin içini kopyala ve Not Defteri'ne yapıştır.
   - "npm" ya da "script tag" seçeneği soruyorsa hangisini seçtiğin önemli değil, ikisinde de aynı değerler var.
   - Bu değerler gizli değil, her web sitesinin kodunda açıkça görünür. Güvenliği Adım 5'teki kurallar sağlar. İstersen bana gönder, dosyaya ben yerleştiririm.
6. **Continue to console** ile ana sayfaya dön.

## Adım 3: Google girişini aç

1. Sol menüde **Security → Authentication**'a tıkla. Eski görünümde bu yol Build → Authentication. Menü kapalıysa sol üstteki ☰ ile aç.
2. İlk kez açıyorsan **Get started** düğmesine tıkla.
3. Üstteki **Sign-in method** sekmesine geç.
4. Sağlayıcı listesinde **Google**'a tıkla.
5. Sağ üstteki **Enable** anahtarını aç.
6. **Public-facing name for project:** `Prog Rock Ağ Atlası` yaz. Kullanıcılar giriş penceresinde bu adı görür.
7. **Support email for project:** listeden kendi e-postanı seç.
8. **Save**. Listede Google'ın yanında **Enabled** yazmalı.

## Adım 4: Site adresine izin ver

1. Aynı Authentication sayfasında üstteki **Settings** sekmesine geç.
2. Soldaki listeden **Authorized domains**'i seç.
3. Listede `localhost` ve `prog-rock-atlas.firebaseapp.com` gibi adresler zaten var. **Add domain** düğmesine tıkla.
4. Başına `https://` koymadan şunu yaz: `cesarecarr.github.io`
5. **Add**.
   - Bu adım atlanırsa sitede "Bu adres için giriş henüz açılmadı" uyarısı çıkar.

## Adım 5: Veritabanını oluştur ve kuralları koy

1. Sol menüde **Databases & Storage → Firestore**'a tıkla. Eski görünümde bu yol Build → Firestore Database.
2. **Create database** düğmesine tıkla.
3. **Edition** sorulursa **Standard edition**'ı seç → **Next**.
4. **Database ID** sorulursa `(default)` olarak bırak.
5. **Location:** listeden **`europe-west3 (Frankfurt)`**'ı seç → **Next**.
   - Gizlilik metninde "listeler AB'de saklanır" diyoruz. Konum sonradan **değiştirilemez**, dikkatli seç.
6. Güvenlik modu: **Start in production mode** → **Create**.
7. Veritabanı açılınca üstteki **Rules** sekmesine geç.
8. Editördeki her şeyi sil (Ctrl+A → Delete).
9. Bilgisayarındaki `v7\firestore.rules` dosyasını Not Defteri ile aç, tamamını kopyala (Ctrl+A → Ctrl+C) ve editöre yapıştır.
10. **Publish**. Kurallar hata vermeden yayınlanmalı.

## Adım 6: `firebase-config.js` dosyasını doldur

1. `v7` klasöründe `firebase-config.js`'ye sağ tıkla → **Birlikte aç → Not Defteri**.
2. Adım 2'de kopyaladığın 6 değeri tırnakların arasına yerleştir. Sonuç şöyle görünmeli:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "prog-rock-atlas.firebaseapp.com",
     projectId: "prog-rock-atlas",
     storageBucket: "prog-rock-atlas.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123..."
   };
   ```

   Tırnakları ve satır sonlarındaki virgülleri silme. `measurementId` diye bir satır gördüysen onu eklemene gerek yok.
3. Alttaki `SITE_OWNER` bölümünü doldur. Bu bilgiler gizlilik metninde "sorumlu kişi" olarak görünür:

   ```js
   window.SITE_OWNER = {
     name: "Adın Soyadın",
     city: "Şehir, Österreich",
     email: "iletisim@adresin.at"
   };
   ```

4. **Dosya → Kaydet** (Ctrl+S). Kodlama sorulursa **UTF-8** seç.

> Gizlilik metnini (EN/TR/DE) GDPR'a göre olağan bir şablon olarak yazdım, ama hukuki danışmanlık değil. Avusturya'da özel sitelerde bile basit bir künye (Offenlegung: ad ve yaşanan yer) istenebiliyor. Emin olmak istersen bir uzmana kısaca baktır.

## Adım 7: Siteye yükle

1. `v7` klasöründeki şu 7 dosyayı GitHub'daki `prog-rock-atlas` klasörüne kopyala ve eskilerinin üzerine yaz:
   `index.html`, `app.js`, `hesap.js`, `firebase-config.js`, `ui_tr.json`, `ui_en.json`, `ui_de.json`
2. GitHub Desktop'ta özet satırına ör. `v7 hesap sistemi` yaz → **Commit to main** → **Push origin**.
3. 1–2 dakika bekle → siteyi aç → **Ctrl+F5**.

`firestore.rules` ve bu rehberin yüklenmesine gerek yok.

## Adım 8: Test et

1. **Bilgisayarda:** Ayarlar'ın en üstünde **Hesap** bölümü görünmeli → **Google ile giriş yap**.
   - Açılan küçük pencerede hesabını seç. Pencere hiç açılmıyorsa adres çubuğunun sağındaki "açılır pencere engellendi" simgesinden bu siteye izin ver.
2. Adın ve e-postan görünmeli, altında **"✓ Listelerin hesabınla eşitlendi"** yazmalı. Cihazda listen varsa "Bu cihazdaki X liste hesabına eklendi" mesajı da çıkar.
3. **Kontrol:** Firebase konsolu → Firestore → **Data** sekmesi → `users` → (uzun bir kimlik) → `lists` altında listelerini görmelisin.
4. **Telefonda:** siteyi aç → Ayarlar → aynı Google hesabıyla giriş yap → Listelerim'de aynı listeler olmalı.
5. **Canlı eşitleme:** telefonda bir listeye parça ekle. Bilgisayarda Listelerim açıksa parça birkaç saniye içinde, sayfayı yenilemeden görünmeli.
6. **Çıkış:** Ayarlar → Çıkış yap. Listeler cihazdan kalkar, tekrar giriş yapınca geri gelir.
7. **Hesap silme** (istersen başka bir Google hesabıyla dene): Google bir kez daha onay ister, sonra hesap ve listeler silinir. Konsolda o kullanıcı da kaybolur.

Sorun çıkarsa ekran görüntüsünü ve tarayıcıda **F12 → Console** sekmesindeki kırmızı satırları gönder.

---

### Sık karşılaşılabilecek hatalar

| Gördüğün | Sebep | Çözüm |
|---|---|---|
| Ayarlar'da Hesap bölümü yok | `firebase-config.js` boş ya da yüklenmemiş, veya tarayıcı eski sürümü gösteriyor | Dosyayı kontrol et, yeniden yükle, Ctrl+F5 |
| "Bu adres için giriş henüz açılmadı" | Adım 4 eksik | `cesarecarr.github.io` adresini ekle |
| "Giriş penceresi engellendi" | Açılır pencere engelleyici | Bu site için açılır pencerelere izin ver |
| Giriş oluyor ama "Bağlantı sorunu" yazıyor | Firestore oluşturulmamış ya da kurallar yayınlanmamış | Adım 5'i kontrol et |
| Console'da `auth/invalid-api-key` | apiKey yanlış kopyalanmış | Adım 2'deki değeri yeniden kopyala |
| Console'da `auth/configuration-not-found` | Google sağlayıcısı açılmamış | Adım 3'ü yap |

### Nasıl çalışıyor (kısaca)

- Giriş **isteğe bağlı**. Girişsiz kullanıcılar için hiçbir şey değişmiyor, Firebase kodu onlarda hiç yüklenmiyor.
- İlk girişte cihazdaki listeler hesaptakilerle **birleştirilir**, hiçbir şey silinmez. Sonrasında her değişiklik anında hesaba yazılır ve diğer cihazlara canlı olarak gelir.
- Çıkışta listeler cihazdan silinir (paylaşılan bilgisayarda kalmasın diye), hesapta durmaya devam eder.
- Veri yapısı: `users/{uid}/lists/{listId}` → `{id, name, created, items[]}`. Liste başına en fazla 3.000 parça.
- Ücretsiz kotalar (günde 50.000 okuma, 20.000 yazma, 3.000 aktif kullanıcı) bu proje için fazlasıyla yeterli.
