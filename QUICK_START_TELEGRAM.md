# Quick Start - Telegram Bot Setup

## 🚀 **5 Langkah Mudah (5 Menit)**

### **Step 1: Buat Telegram Bot**
1. Buka Telegram → Cari **@BotFather**
2. Kirim: `/newbot`
3. Nama bot: `Flood Alert Bot`
4. Username: `flood_alert_[angka]_bot`
5. **Copy Bot Token**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### **Step 2: Dapatkan Chat ID**
1. Cari **@userinfobot** di Telegram
2. Kirim pesan apa saja
3. **Copy Chat ID**: `123456789`

### **Step 3: Setup Dashboard**
```powershell
# Clone dan install
git clone [repository-url]
cd dashboard-arise
npm install

# Copy environment file
copy .env.local.example .env.local

# Edit .env.local
notepad .env.local
```

Ganti di `.env.local`:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### **Step 4: Jalankan Dashboard**
```powershell
npm run dev
```
Buka: http://localhost:3000

### **Step 5: Test Telegram**
1. Scroll ke **"Telegram Alerts"**
2. Masukkan **Chat ID**: `123456789`
3. Klik **"Test"**
4. Cek Telegram → Harus ada pesan! ✅

---

## 🧪 **Test dengan Simulator**

### **Tanpa Hardware:**
```powershell
# Terminal 1: Dashboard
npm run dev

# Terminal 2: Simulator
node mqtt-simulator-telegram.js
# Tekan 'f' untuk simulasi banjir
# Tekan 't' untuk test Telegram
```

### **Dengan Hardware:**
1. Edit `arduino-code/config.h`
2. Upload `flood_mitigation_telegram.ino`
3. Monitor Serial → Lihat log Telegram

---

## 📱 **Contoh Pesan Alert**

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

---

## 🔧 **Troubleshooting Cepat**

### **"Bot Token not configured"**
- Pastikan Bot Token di `.env.local` benar
- Restart: `npm run dev`

### **"Chat not found"**
- Chat ID salah
- Chat ke bot Anda sekali dulu

### **"HTTP 401 Error"**
- Bot Token salah
- Buat bot baru di @BotFather

### **Tidak dapat pesan**
- Pastikan sudah chat ke bot
- Cek Chat ID benar
- Bot mungkin di-block

---

## 🎯 **Berhasil Jika:**

✅ Dashboard terbuka di http://localhost:3000  
✅ Status "Connected" di dashboard  
✅ Data sensor berubah real-time  
✅ Test Telegram berhasil  
✅ Pesan alert masuk ke Telegram  

**🎉 Selamat! Sistem Anda sudah siap melindungi dari banjir!**

---

## 📞 **Butuh Bantuan?**

1. **Cek Serial Monitor** Arduino untuk debug
2. **Lihat Console** browser untuk error
3. **Test step-by-step** jangan skip langkah
4. **Restart semua** jika masih error

**💡 Tip:** Bookmark chat bot Anda untuk akses cepat saat emergency!
