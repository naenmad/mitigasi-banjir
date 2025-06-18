# Setup Telegram Bot untuk Flood Mitigation System

## 🤖 **Mengapa Telegram Bot?**

✅ **100% Gratis** - Tidak ada biaya berlangganan  
✅ **Setup Mudah** - Hanya butuh 5 menit  
✅ **Unlimited Messages** - Tidak ada batasan pesan  
✅ **Real-time Notifications** - Alert instant ke ponsel  
✅ **No Phone Number Required** - Cukup username Telegram  
✅ **Cross-platform** - Android, iOS, Desktop, Web  

## 🚀 **Langkah Setup (5 Menit)**

### **Step 1: Buat Bot Baru**

1. **Buka Telegram** di ponsel atau desktop
2. **Cari dan chat** @BotFather
3. **Kirim perintah:** `/newbot`
4. **Masukkan nama bot:** `Flood Alert Bot` (atau nama lain)
5. **Masukkan username bot:** `flood_alert_123_bot` (harus unik, diakhiri `_bot`)
6. **Copy Bot Token** yang diberikan (contoh: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### **Step 2: Dapatkan Chat ID**

1. **Cari dan chat** @userinfobot di Telegram
2. **Kirim pesan** apa saja ke bot tersebut
3. **Copy Chat ID** yang diberikan (contoh: `123456789`)

### **Step 3: Konfigurasi Dashboard**

Edit file `.env.local` di root project:
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### **Step 4: Konfigurasi Arduino**

Edit file `arduino-code/config.h`:
```cpp
// ========================================
// Telegram Bot Configuration
// ========================================
const String TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
const String TELEGRAM_CHAT_ID = "123456789";
```

### **Step 5: Test Sistem**

1. **Jalankan dashboard:** `npm run dev`
2. **Buka:** http://localhost:3000
3. **Scroll ke "Telegram Alerts"**
4. **Masukkan Chat ID** Anda
5. **Klik "Test"**
6. **Cek Telegram** - Anda harus menerima pesan test!

## 📱 **Format Pesan Alert**

Sistem akan mengirim pesan seperti ini:

```
🚨 FLOOD ALERT 🚨

⛔ Risk Level: CRITICAL

📊 Current Data:
💧 Water Level: 75.2 cm
🌊 Flow Rate: 28.5 L/min
🌡️ Temperature: 26.5°C
💨 Humidity: 78%
🌧️ Rainfall: 15.2 mm/h
🕒 Time: 2025-06-18 14:30:25

📝 Recommendation:
🆘 IMMEDIATE EVACUATION REQUIRED!
Flood imminent within 15 minutes.

🏠 Flood Mitigation System
📍 Location: Flood Monitoring Station
```

## ⚙️ **Kustomisasi Alert**

### **1. Ubah Level Alert yang Dikirim**
Di `config.h`:
```cpp
#define CRITICAL_ALERT_ONLY true    // Hanya CRITICAL
// atau
#define CRITICAL_ALERT_ONLY false   // HIGH + CRITICAL
```

### **2. Ubah Interval Alert**
```cpp
#define ALERT_COOLDOWN_MINUTES 5    // 5 menit
```

### **3. Aktifkan Location Sharing**
```cpp
#define ENABLE_LOCATION_SHARING true
const float LOCATION_LATITUDE = -6.302536;   // Latitude lokasi Anda
const float LOCATION_LONGITUDE = 107.300224; // Longitude lokasi Anda
```

### **4. Custom Message Template**
Edit fungsi `sendFloodAlert()` di Arduino code untuk mengubah format pesan.

## 🔧 **Troubleshooting**

### **"Bot Token not configured"**
- Pastikan `TELEGRAM_BOT_TOKEN` sudah di `.env.local`
- Restart development server: `npm run dev`

### **"Chat not found"**
- Chat ID salah atau belum chat ke bot
- Chat ke bot Anda sekali dulu, baru masukkan Chat ID

### **"HTTP Error 401"**
- Bot Token salah atau expired
- Buat bot baru di @BotFather

### **"HTTP Error 400"**
- Format pesan salah (biasanya karena Markdown invalid)
- Cek Arduino Serial Monitor untuk detail error

### **Bot tidak merespon**
- Pastikan bot tidak di-block atau di-delete
- Test di dashboard dulu sebelum test di Arduino

## 🌟 **Fitur Advanced (Opsional)**

### **1. Multiple Recipients**
Tambahkan Chat ID keluarga/tetangga di Arduino:
```cpp
String chatIds[] = {
  "123456789",  // Anda
  "987654321",  // Keluarga
  "555666777"   // Tetangga
};
```

### **2. Bot Commands**
Tambahkan perintah ke bot (edit di @BotFather):
- `/status` - Cek status sistem
- `/data` - Data sensor terkini
- `/help` - Bantuan

### **3. Group Notifications**
- Buat Telegram Group
- Invite bot ke group
- Gunakan Group Chat ID

## 💡 **Tips & Best Practices**

### **Keamanan:**
1. **Jangan share** Bot Token di public
2. **Gunakan .env.local** untuk credentials
3. **Backup** konfigurasi bot

### **Reliability:**
1. **Test rutin** untuk memastikan bot aktif
2. **Monitor** Arduino Serial untuk error
3. **Backup power** untuk sistem monitoring

### **Optimasi:**
1. **Cooldown** mencegah spam alert
2. **Conditional alerts** hemat bandwidth
3. **Location sharing** untuk emergency response

## 📞 **Bantuan Lebih Lanjut**

Jika ada masalah:
1. **Cek Serial Monitor** Arduino untuk debug
2. **Test API** di dashboard dulu
3. **Validasi** Bot Token dan Chat ID
4. **Restart** sistem jika perlu

---

**🎉 Selamat!** Sistem Telegram Alert sudah siap melindungi Anda dari banjir! 💪

**📲 Pro Tip:** Bookmark chat bot Anda untuk akses cepat saat emergency!
