# Setup WhatsApp Alerts dengan Twilio

## 🚨 **Langkah Setup Twilio WhatsApp**

### **1. Daftar Twilio Account**

1. **Kunjungi** https://www.twilio.com/try-twilio
2. **Daftar** dengan email Anda (Free trial tersedia)
3. **Verifikasi** nomor telepon Anda
4. **Login** ke Twilio Console

### **2. Setup WhatsApp Sandbox**

1. **Di Twilio Console**, buka **Messaging** → **Try it out** → **Send a WhatsApp message**
2. **Copy** nomor sandbox: `+1 415 523 8886`
3. **Kirim WhatsApp** ke nomor tersebut dengan kode join yang diberikan
   ```
   Contoh: join <kode-unik-anda>
   ```
4. **Tunggu konfirmasi** dari Twilio

### **3. Dapatkan Credentials**

1. **Di Twilio Console**, buka **Account** → **API keys & tokens**
2. **Copy** nilai berikut:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Klik "View" untuk melihat token

### **4. Konfigurasi Arduino**

Edit file `config.h`:
```cpp
// ========================================
// Twilio WhatsApp Configuration  
// ========================================
const String TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Ganti dengan Account SID Anda
const String TWILIO_AUTH_TOKEN = "your_auth_token_here";             // Ganti dengan Auth Token Anda
const String TWILIO_PHONE_NUMBER = "whatsapp:+14155238886";          // Nomor Twilio Sandbox
const String RECIPIENT_PHONE_NUMBER = "whatsapp:+628123456789";      // Nomor WhatsApp Anda

// WhatsApp Alert Settings
#define ENABLE_WHATSAPP_ALERTS true           // Enable WhatsApp notifications
#define ALERT_COOLDOWN_MINUTES 10             // Interval minimum antar alert (menit)
#define CRITICAL_ALERT_ONLY false             // true = hanya CRITICAL, false = HIGH + CRITICAL
```

### **5. Konfigurasi Dashboard**

Edit file `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### **6. Format Nomor WhatsApp**

Gunakan format internasional:
```
Indonesia: whatsapp:+628123456789
US:        whatsapp:+14151234567
UK:        whatsapp:+447912345678
```

## 📱 **Cara Kerja WhatsApp Alert**

### **Trigger Otomatis:**
- ✅ Alert dikirim saat risk level **HIGH** atau **CRITICAL**
- ✅ Cooldown 10 menit untuk mencegah spam
- ✅ Tidak mengirim alert yang sama berulang

### **Format Pesan:**
```
🚨 FLOOD ALERT 🚨

⚠️ Risk Level: CRITICAL
📊 Data Sensor:
💧 Water Level: 75.2 cm
🌊 Flow Rate: 28.5 L/min
🕒 Time: 2025-06-18 14:30:25

📝 Recommendation:
IMMEDIATE EVACUATION REQUIRED! 
Flood imminent within 15 minutes.

🏠 Flood Mitigation System
Location: Your monitoring location
```

## 🧪 **Testing WhatsApp Alert**

### **1. Test dari Dashboard:**
1. Buka dashboard: `http://localhost:3000`
2. Scroll ke **WhatsApp Alerts** section
3. Masukkan nomor WhatsApp Anda
4. Klik **"Send Test Alert"**

### **2. Test dari Arduino:**
1. Upload code ke ESP32
2. Buka Serial Monitor
3. Simulasikan kondisi HIGH/CRITICAL:
   - Turunkan sensor HC-SR04 ke air
   - Atau edit threshold di config.h sementara

### **3. Expected Serial Output:**
```
Sending WhatsApp alert...
Message: 🚨 FLOOD ALERT 🚨 ...
WhatsApp alert HTTP Response: 201
✅ WhatsApp alert sent successfully!
```

## ⚙️ **Kustomisasi Alert**

### **Ubah Threshold Alert:**
```cpp
// Kirim alert hanya untuk CRITICAL
#define CRITICAL_ALERT_ONLY true

// Atau ubah cooldown
#define ALERT_COOLDOWN_MINUTES 5  // 5 menit
```

### **Custom Message Template:**
Edit fungsi `sendWhatsAppAlert()` di Arduino code:
```cpp
String message = "🚨 *CUSTOM FLOOD ALERT* 🚨\n\n";
message += "📍 *Location: Rumah Saya*\n";
message += "⚠️ *Risk: " + alertLevel + "*\n";
// ... tambahkan custom text
```

### **Multiple Recipients:**
Tambahkan array nomor di Arduino:
```cpp
String recipients[] = {
  "whatsapp:+628123456789",  // Anda
  "whatsapp:+628987654321",  // Keluarga
  "whatsapp:+628111222333"   // Tetangga
};
```

## 🔧 **Troubleshooting**

### **"Failed to send WhatsApp alert"**
1. **Periksa credentials** Twilio di config.h
2. **Pastikan nomor sudah join** sandbox
3. **Check internet connection** ESP32
4. **Lihat Serial Monitor** untuk error detail

### **"Sandbox not joined"**
1. **Kirim WhatsApp** ke +1 415 523 8886
2. **Dengan pesan**: `join <kode-sandbox-anda>`
3. **Tunggu reply** konfirmasi dari Twilio

### **"HTTP Error 401"**
- **Account SID** atau **Auth Token** salah
- Copy ulang dari Twilio Console

### **"HTTP Error 400"**
- **Format nomor salah** (harus +62xxx, bukan 08xxx)
- **Nomor belum join sandbox**

## 💰 **Pricing Twilio**

### **Free Trial:**
- **$15.50 USD** credit gratis
- **WhatsApp messages**: ~$0.005-0.015 per pesan
- **Cukup untuk** ~1000+ pesan

### **Setelah Trial:**
- **Pay-as-you-go** model
- **WhatsApp**: $0.005-0.015 per pesan
- **SMS fallback**: $0.0075 per SMS

## 🔒 **Keamanan**

1. **Jangan commit** credentials ke Git
2. **Gunakan .env.local** untuk dashboard
3. **Ganti Auth Token** secara berkala
4. **Monitor usage** di Twilio Console

## 📞 **Upgrade ke Production**

Untuk penggunaan production:
1. **Upgrade Twilio account** dari trial
2. **Apply WhatsApp Business API** (requires approval)
3. **Custom sender number** dengan brand verification
4. **Higher rate limits** dan reliability

---

**🎉 Selamat!** Sistem WhatsApp alert sudah siap melindungi Anda dari banjir! 💪
