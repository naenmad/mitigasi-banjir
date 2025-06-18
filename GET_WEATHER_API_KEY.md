# Cara Mendapatkan OpenWeatherMap API Key

## 🌤️ **Step-by-Step (Gratis)**

### **1. Daftar Account**
1. Buka: https://openweathermap.org/api
2. Klik **"Sign Up"** (pojok kanan atas)
3. Isi form pendaftaran:
   - Username: `your_username`
   - Email: `your_email@gmail.com`
   - Password: `your_password`
4. Klik **"Create Account"**

### **2. Verifikasi Email**
1. Cek email Anda
2. Klik link verifikasi dari OpenWeatherMap
3. Login ke account Anda

### **3. Dapatkan API Key**
1. Setelah login, buka: https://home.openweathermap.org/api_keys
2. Anda akan melihat **Default API Key** yang sudah dibuat
3. **Copy API Key** (contoh: `abcd1234efgh5678ijkl9012mnop3456`)

### **4. Update Config Arduino**
Edit file `config.h`:
```cpp
const String WEATHER_API_KEY = "abcd1234efgh5678ijkl9012mnop3456";  // API key baru
const String WEATHER_CITY = "Jakarta";      // Ubah ke kota besar dulu
const String WEATHER_COUNTRY = "ID";
```

### **5. Test API Key**
Upload dan jalankan `weather_debug.ino` untuk test API:
1. Buka Arduino IDE
2. Upload `weather_debug.ino`
3. Buka Serial Monitor
4. Lihat output - harus ada data cuaca

## 🧪 **Test Manual (Browser)**

Test API key di browser:
```
http://api.openweathermap.org/data/2.5/weather?q=Jakarta,ID&appid=YOUR_API_KEY&units=metric
```

Response sukses:
```json
{
  "weather": [{"main": "Rain", "description": "light rain"}],
  "main": {"temp": 27.5, "humidity": 78},
  "rain": {"1h": 2.5}
}
```

## 🚨 **Troubleshooting**

### **"401 Unauthorized"**
- API key salah atau belum aktif
- Tunggu 10-15 menit setelah daftar untuk aktivasi

### **"404 Not Found"**
- Nama kota salah
- Coba ganti ke "Jakarta" atau "Bandung"

### **"429 Too Many Requests"**
- Limit API tercapai (60 calls/minute untuk free)
- Tunggu 1 menit

### **Rainfall masih 0mm**
- **Normal** jika memang tidak hujan!
- Cek di https://weather.com apakah sedang hujan
- Gunakan dummy data untuk testing

## 💡 **Tips**

1. **Free Plan**: 60 calls/minute, 1000 calls/day
2. **Aktivasi**: API key butuh 10-15 menit untuk aktif
3. **Testing**: Gunakan kota besar seperti Jakarta/Surabaya
4. **Dummy Data**: Untuk testing, bisa pakai data random

## 🔄 **Alternative: Dummy Weather Data**

Jika tidak mau pakai API, edit fungsi weather:
```cpp
void updateWeatherData() {
  // Dummy data untuk testing
  temperature = 26.0 + random(-30, 30) / 10.0;
  humidity = 65.0 + random(-200, 200) / 10.0;
  rainfall = random(0, 200) / 10.0;  // 0-20mm random
  
  Serial.println("🌤️ Dummy weather: " + String(temperature) + "°C, " + 
                 String(humidity) + "%, Rain: " + String(rainfall) + "mm");
}
