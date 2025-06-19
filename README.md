# Flood Mitigation IoT Dashboard

Sistem IoT untuk mitigasi banjir yang terdiri dari dashboard web dan perangkat sensor untuk monitoring real-time ketinggian air dan kecepatan aliran air, dengan prediksi banjir berbasis sensor.

## 🌊 Versi Sistem

### PURE SENSOR VERSION (Terbaru)
- **Fokus**: Hanya menggunakan sensor air (Water Level + Flow Rate)
- **Keunggulan**: 100% gratis, tidak ada biaya API cuaca
- **Prediksi**: Berdasarkan data sensor saja
- **File**: `flood_mitigation_pure_sensor.ino`, `mqtt-simulator-pure-sensor.js`

### NO API VERSION (Alternatif)
- **Fokus**: Sensor + simulasi weather dummy
- **Keunggulan**: Gratis, weather data simulasi
- **File**: `flood_mitigation_no_api.ino`, `mqtt-simulator-no-api.js`

## Komponen Sistem

### Hardware Requirements
- **Microcontroller**: ESP32 atau ESP8266
- **Sensor Ultrasonic**: HC-SR04 (untuk mengukur ketinggian air)
- **Sensor Flow**: YF-S201 (untuk mengukur kecepatan aliran air)
- **Koneksi WiFi**: Untuk komunikasi dengan HiveMQ broker

### Pin Configuration
- **HC-SR04 Ultrasonic Sensor**:
  - Trig Pin → GPIO 2
  - Echo Pin → GPIO 4
  - VCC → 5V
  - GND → GND

- **YF-S201 Flow Sensor**:
  - Signal Pin → GPIO 5
  - VCC → 5V
  - GND → GND

### Software Components
- **Frontend Dashboard**: Next.js dengan React dan TailwindCSS
- **Backend**: Node.js dengan MQTT client
- **Broker MQTT**: HiveMQ Cloud
- **Charts**: Chart.js dan react-chartjs-2
- **Icons**: Lucide React

## Fitur Dashboard

### 1. Real-time Monitoring
- Monitor ketinggian air dalam cm
- Monitor kecepatan aliran air dalam L/min
- Status koneksi real-time

### 2. Sistem Peringatan
- 4 Level risiko: LOW, MEDIUM, HIGH, CRITICAL
- Notifikasi visual dengan warna berbeda
- Rekomendasi tindakan berdasarkan level risiko

### 3. Visualisasi Data
- Grafik tren ketinggian air
- Grafik tren kecepatan aliran
- Riwayat data sensor (50 data point terakhir)

### 4. Prediksi Banjir
- Algoritma prediksi berdasarkan:
  - Ketinggian air saat ini
  - Kecepatan aliran air
  - Data curah hujan
- Estimasi waktu hingga banjir (jika ada)
- Rekomendasi tindakan pencegahan

### 5. Telegram Bot Notifications
- Notifikasi real-time ke Telegram saat risiko tinggi
- Alert otomatis untuk level HIGH dan CRITICAL
- Format pesan lengkap dengan data sensor dan rekomendasi
- Gratis dan unlimited notifications
- Setup mudah tanpa subscription fee

## 🚀 Quick Start

### Opsi A: Pure Sensor Version (Rekomendasi)

**Untuk sistem 100% gratis tanpa API cuaca:**

1. **Dashboard**: 
```bash
cd dashboard-arise
npm install
npm run dev
```

2. **Simulator (untuk testing tanpa hardware)**:
```bash
node mqtt-simulator-pure-sensor.js
```

3. **Arduino**: Upload `flood_mitigation_pure_sensor.ino` dengan `config-pure-sensor.h`

### Opsi B: Testing dengan Simulator Lama

**Jika ingin tetap melihat simulasi weather (dummy data):**

```bash
node mqtt-simulator-no-api.js
```

## Instalasi dan Setup

### 1. Setup Dashboard

```bash
# Clone repository dan install dependencies
cd dashboard-arise
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dan tambahkan TELEGRAM_BOT_TOKEN

# Jalankan development server
npm run dev
```

Dashboard akan tersedia di `http://localhost:3000`

### 2. Setup Telegram Bot

1. **Buat Bot**: Chat @BotFather di Telegram, kirim `/newbot`
2. **Copy Bot Token** dan tambahkan ke `.env.local`:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```
3. **Dapatkan Chat ID**: Chat @userinfobot untuk mendapatkan Chat ID Anda
4. **Test di Dashboard**: Masukkan Chat ID dan klik Test

📖 **Detail lengkap**: Lihat [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)

### 3. Setup Arduino

1. Buka file `arduino-code/flood_mitigation_telegram.ino` di Arduino IDE
2. Install library yang dibutuhkan:
   - WiFi library (built-in ESP32/ESP8266)
   - PubSubClient
   - ArduinoJson
   - HTTPClient (built-in)

3. Edit file `arduino-code/config.h`:
```cpp
// WiFi Configuration
const char* WIFI_SSID = "12345678";
const char* WIFI_PASSWORD = "12345678";

// Telegram Configuration
const String TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
const String TELEGRAM_CHAT_ID = "123456789";
```

4. (Opsional) Dapatkan API key dari OpenWeatherMap untuk data cuaca

5. Upload kode ke ESP32/ESP8266

📖 **Detail lengkap**: Lihat [HARDWARE_SETUP.md](HARDWARE_SETUP.md)

### 4. Wiring Diagram

```
ESP32/ESP8266    HC-SR04    YF-S201
============    =======    =======
GPIO 2    <-->  Trig
GPIO 4    <-->  Echo
GPIO 5    <-->             Signal
5V        <-->  VCC        VCC
GND       <-->  GND        GND
```

## Cara Kerja Sistem

### 1. Pengumpulan Data Sensor
- **HC-SR04**: Mengukur jarak dari sensor ke permukaan air untuk menghitung ketinggian air
- **YF-S201**: Menghitung pulsa untuk mengukur kecepatan aliran air
- **Weather API**: Mengambil data curah hujan dari OpenWeatherMap

### 2. Transmisi Data
- Data sensor dikirim ke HiveMQ broker melalui WiFi
- Menggunakan protokol MQTT dengan topic:
  - `flood-mitigation/sensors/data`: Data sensor utama
  - `flood-mitigation/weather/data`: Data cuaca
  - `flood-mitigation/prediction/data`: Hasil prediksi

### 3. Algoritma Prediksi Banjir
Sistem menggunakan scoring berdasarkan:
- **Ketinggian Air** (40% bobot): Semakin tinggi, semakin berisiko
- **Kecepatan Aliran** (30% bobot): Aliran tinggi menandakan hujan deras
- **Curah Hujan** (30% bobot): Data real-time dari weather API

### 4. Level Peringatan
- **LOW** (0-24%): Kondisi normal, lanjutkan monitoring
- **MEDIUM** (25-49%): Waspada, monitor ketat kondisi
- **HIGH** (50-74%): Siap-siap evakuasi, banjir mungkin dalam 45 menit
- **CRITICAL** (75-100%): Evakuasi segera! Banjir dalam 15 menit

## MQTT Topics

### Sensor Data Topic: `flood-mitigation/sensors/data`
```json
{
  "timestamp": 1640995200,
  "waterLevel": 25.5,
  "flowRate": 12.3,
  "rainfall": 5.2,
  "floodRisk": "MEDIUM"
}
```

### Weather Data Topic: `flood-mitigation/weather/data`
```json
{
  "timestamp": 1640995200,
  "rainfall": 5.2,
  "humidity": 78.5,
  "temperature": 26.8
}
```

### Prediction Data Topic: `flood-mitigation/prediction/data`
```json
{
  "timestamp": 1640995200,
  "riskLevel": "HIGH",
  "probability": 0.65,
  "timeToFlood": 45,
  "recommendation": "Prepare for evacuation. Flood likely within 45 minutes."
}
```

## Kustomisasi

### 1. Mengubah Threshold Peringatan
Edit nilai threshold di file Arduino:
```cpp
if (waterLevel >= 60) {
    floodRisk = "CRITICAL";
} else if (waterLevel >= 40) {
    floodRisk = "HIGH";
} else if (waterLevel >= 20) {
    floodRisk = "MEDIUM";
}
```

### 2. Mengubah Interval Pengiriman Data
```cpp
const unsigned long SENSOR_INTERVAL = 5000;  // 5 detik
const unsigned long WEATHER_INTERVAL = 60000; // 1 menit
const unsigned long PREDICTION_INTERVAL = 30000; // 30 detik
```

### 3. Kalibrasi Sensor
Untuk HC-SR04, sesuaikan tinggi pemasangan sensor:
```cpp
// Assuming sensor is mounted 100cm above ground
float waterLevelCm = 100.0 - distance;
```

## Troubleshooting

### 1. Dashboard tidak menampilkan data
- Periksa koneksi internet
- Pastikan HiveMQ broker dapat diakses
- Cek console browser untuk error MQTT

### 2. Sensor tidak terbaca
- Periksa wiring dan koneksi pin
- Pastikan power supply cukup (5V untuk sensor)
- Monitor Serial Monitor Arduino untuk debug

### 3. Prediksi tidak akurat
- Kalibrasi ulang threshold berdasarkan kondisi lokal
- Sesuaikan algoritma scoring di fungsi `generateFloodPrediction()`
- Tambahkan faktor lingkungan lain (topografi, drainage, dll)

## Pengembangan Lanjutan

### 1. Fitur Tambahan
- Notifikasi push/email/SMS saat risiko tinggi
- Database untuk menyimpan riwayat data historis
- Machine learning untuk prediksi yang lebih akurat
- Integrasi dengan sistem peringatan dini nasional

### 2. Sensor Tambahan
- Sensor pH air
- Sensor turbidity (kekeruhan)
- Sensor suhu air
- Kamera untuk monitoring visual

### 3. Ekspansi Sistem
- Multiple sensor nodes di berbagai lokasi
- Dashboard untuk monitoring multi-lokasi
- API untuk integrasi dengan sistem lain
- Mobile app untuk monitoring di lapangan

## Kontribusi

Project ini dikembangkan untuk sistem mitigasi banjir. Kontribusi dan perbaikan sangat diterima untuk meningkatkan akurasi dan fungsionalitas sistem.

## Lisensi

MIT License - Bebas digunakan untuk tujuan edukasi dan pengembangan sistem mitigasi banjir.
