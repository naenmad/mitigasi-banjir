# Fix "Chat Not Found" Error - Step by Step

## 🚨 **Error: "chat not found"**

Error ini terjadi karena **bot belum pernah menerima pesan dari Anda**. Telegram memerlukan bot menerima pesan dari user terlebih dahulu sebelum bisa mengirim pesan balik.

## 🛠️ **Solusi Langkah Demi Langkah**

### **Step 1: Pastikan Bot Sudah Dibuat**
1. Buka Telegram
2. Cari **@BotFather**
3. Jika belum ada bot, kirim `/newbot` dan ikuti instruksi
4. **Copy Bot Token** dan simpan

### **Step 2: Update Environment File**
Edit file `.env.local`:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### **Step 3: Mulai Chat dengan Bot Anda**
1. **Cari bot Anda** di Telegram dengan username yang dibuat
2. **Klik bot** untuk membuka chat
3. **Klik "START"** atau kirim pesan apa saja (misal: "hello")
4. **Bot harus menerima pesan ini** terlebih dahulu

⚠️ **PENTING:** Tanpa langkah ini, bot tidak bisa mengirim pesan ke Anda!

### **Step 4: Dapatkan Chat ID**
1. **Cari @userinfobot** di Telegram
2. **Start** bot tersebut
3. **Kirim pesan** apa saja ke @userinfobot
4. **Copy Chat ID** yang diberikan (contoh: `123456789`)

### **Step 5: Test di Dashboard**
1. Buka dashboard: `http://localhost:3000`
2. Scroll ke **"Telegram Alerts"**
3. **Masukkan Chat ID**: `123456789`
4. **Klik "Test"**

## ✅ **Verifikasi Berhasil**

Jika berhasil, Anda akan:
- ✅ Menerima pesan test di Telegram
- ✅ Melihat "✅ Test alert sent successfully!" di dashboard
- ✅ Alert history menunjukkan status "sent"

## 🔧 **Masih Error? Coba Ini:**

### **1. Cek Bot Token**
```bash
# Test manual di browser/curl:
https://api.telegram.org/bot[BOT_TOKEN]/getMe

# Jika valid, akan return info bot
# Jika invalid, akan return error 401
```

### **2. Cek Chat ID Format**
- **Benar**: `123456789` (angka saja)
- **Salah**: `@username` atau `user123`
- **Group Chat**: Biasanya dimulai dengan `-` (misal: `-123456789`)

### **3. Restart Development Server**
```bash
# Stop server (Ctrl+C)
npm run dev
# Coba test lagi
```

### **4. Cek Console Browser**
1. Buka Developer Tools (F12)
2. Lihat tab Console untuk error detail
3. Lihat tab Network untuk HTTP request

### **5. Test Manual dengan Curl**
```bash
curl -X POST "https://api.telegram.org/bot[BOT_TOKEN]/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": "123456789",
       "text": "Test manual message"
     }'
```

## 🆘 **Troubleshooting Common Issues**

### **"Unauthorized" (401)**
- Bot token salah atau expired
- Buat bot baru di @BotFather

### **"Bad Request" (400)**
- Chat ID salah format
- Belum start chat dengan bot

### **"Too Many Requests" (429)**
- Terlalu banyak request
- Tunggu 1 menit sebelum coba lagi

### **"Bot was blocked by user"**
- User memblock bot
- Unblock dan kirim /start

## 💡 **Tips Debugging**

1. **Selalu start chat dengan bot dulu** sebelum test
2. **Gunakan Chat ID numerik**, bukan username
3. **Tunggu beberapa detik** setelah setup sebelum test
4. **Cek .env.local** pastikan tidak ada spasi extra
5. **Restart server** setelah ubah environment

## 🎯 **Quick Test**

Cara cepat test bot token:
1. Buka: `https://api.telegram.org/bot[BOT_TOKEN]/getMe`
2. Replace `[BOT_TOKEN]` dengan token asli
3. Jika berhasil: info bot akan muncul
4. Jika gagal: ada masalah dengan token

---

**🎉 Setelah mengikuti langkah ini, error "chat not found" pasti teratasi!**
