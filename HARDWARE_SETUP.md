# Panduan Setup Hardware Arduino untuk Sistem Mitigasi Banjir

## Komponen Hardware yang Dibutuhkan

### 1. Microcontroller
- **ESP32** (Recommended) atau **ESP8266**
- ESP32 DevKit V1 atau NodeMCU ESP32

### 2. Sensor
- **HC-SR04 Ultrasonic Sensor** (1 unit)
- **YF-S201 Water Flow Sensor** (1 unit)

### 3. Komponen Pendukung
- Breadboard atau PCB
- Kabel jumper male-to-male dan male-to-female
- Resistor 10kΩ (untuk pull-up flow sensor jika diperlukan)
- Power supply 5V (untuk sensor)
- Casing waterproof (untuk instalasi outdoor)

## Wiring Diagram Detail

### ESP32 Pinout:
```
ESP32 Pin    |  Komponen     |  Pin Sensor
==========   |  =========    |  ===========
GPIO 2       |  HC-SR04      |  Trig
GPIO 4       |  HC-SR04      |  Echo  
GPIO 5       |  YF-S201      |  Signal (Yellow)
5V/VIN       |  Kedua Sensor |  VCC (Red)
GND          |  Kedua Sensor |  GND (Black)
```

### Wiring HC-SR04:
```
HC-SR04    →    ESP32
-------         -----
VCC        →    5V
GND        →    GND
Trig       →    GPIO 2
Echo       →    GPIO 4
```

### Wiring YF-S201:
```
YF-S201    →    ESP32
-------         -----
Red        →    5V
Black      →    GND
Yellow     →    GPIO 5
```

## Setup Arduino IDE

### 1. Install Arduino IDE
- Download dari: https://www.arduino.cc/en/software
- Install Arduino IDE 2.x (terbaru)

### 2. Install ESP32 Board Manager
1. Buka Arduino IDE
2. File → Preferences
3. Tambahkan URL berikut di "Additional Board Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Cari "ESP32" dan install "ESP32 by Espressif Systems"

### 3. Install Library yang Diperlukan
Buka Library Manager (Ctrl+Shift+I) dan install:

1. **PubSubClient** by Nick O'Leary
   - Untuk komunikasi MQTT
   
2. **ArduinoJson** by Benoit Blanchon
   - Untuk parsing JSON data
   
3. **WiFi** (Built-in ESP32)
   - Sudah tersedia di ESP32 core

### 4. Konfigurasi Board
1. Tools → Board → ESP32 Arduino → "ESP32 Dev Module"
2. Tools → Port → Pilih port COM yang sesuai
3. Tools → Upload Speed → 115200
4. Tools → Flash Size → 4MB

## Upload Code ke ESP32

### 1. Buka File Arduino
- Buka file `arduino-code/flood_mitigation_system.ino`

### 2. Konfigurasi WiFi
Ganti dengan WiFi Anda:
```cpp
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";
```

### 3. Konfigurasi Weather API (Opsional)
Untuk data cuaca real-time:
```cpp
const String weatherApiKey = "API_KEY_OPENWEATHERMAP";
const String city = "Jakarta"; // Kota Anda
```

**Cara mendapatkan API Key:**
1. Daftar di https://openweathermap.org/api
2. Buat account gratis
3. Copy API key dari dashboard

### 4. Upload Code
1. Hubungkan ESP32 ke komputer via USB
2. Tekan tombol "Upload" (→) di Arduino IDE
3. Tunggu hingga upload selesai

## Testing Hardware

### 1. Buka Serial Monitor
- Tools → Serial Monitor
- Set baud rate ke 115200
- Lihat output untuk debugging

### 2. Expected Output
```
Flood Mitigation System Started
================================
Connecting to WiFi....
WiFi connected!
IP address: 192.168.1.100
Attempting MQTT connection...connected

Sensor Readings:
================
Water Level: 15.2 cm
Flow Rate: 3.4 L/min

Weather Data:
=============
Temperature: 28.5°C
Humidity: 75%
Rainfall: 2.1 mm/h

Flood Prediction:
=================
Risk Level: LOW
Probability: 15.2%
Recommendation: Normal conditions. Continue monitoring.
================================
```

## Kalibrasi Sensor

### 1. Kalibrasi HC-SR04 (Water Level)
```cpp
// Sesuaikan tinggi pemasangan sensor dari dasar
float waterLevelCm = SENSOR_HEIGHT_CM - distance;
```

**Contoh:** Jika sensor dipasang 80cm dari dasar:
```cpp
float waterLevelCm = 80.0 - distance;
```

### 2. Kalibrasi YF-S201 (Flow Rate)
```cpp
// YF-S201: 1 pulse = 1/450 liters
flowRate = (flowPulseCount / 450.0) * 60.0; // L/min
```

**Untuk sensor flow lain, sesuaikan konstanta:**
- YF-S201: 450 pulses/liter
- YF-B1: 660 pulses/liter
- YF-B2: 450 pulses/liter

## Instalasi Fisik

### 1. Pemasangan HC-SR04
- Pasang di atas saluran air dengan jarak 50-100cm dari permukaan air normal
- Lindungi dari hujan langsung dengan cover
- Pastikan area di bawah sensor bebas dari halangan

### 2. Pemasangan YF-S201
- Pasang in-line dengan pipa saluran air
- Arah aliran sesuai dengan panah di sensor
- Pastikan pipa terisi penuh air untuk pembacaan akurat

### 3. Casing ESP32
- Gunakan box waterproof IP65 atau lebih tinggi
- Buat lubang untuk kabel sensor
- Gunakan cable gland untuk waterproofing

## Troubleshooting

### 1. ESP32 Tidak Terdeteksi
**Solusi:**
- Install driver CP2102/CH340 (tergantung board)
- Tekan tombol BOOT saat upload
- Coba port USB lain

### 2. WiFi Tidak Connect
**Solusi:**
- Periksa SSID dan password
- Pastikan sinyal WiFi kuat
- Coba restart ESP32

### 3. Sensor Reading Error
**Solusi HC-SR04:**
- Periksa wiring Trig dan Echo
- Pastikan power supply 5V stabil
- Bersihkan permukaan sensor dari debu

**Solusi YF-S201:**
- Periksa wiring signal pin
- Pastikan ada aliran air minimal
- Test dengan air mengalir manual

### 4. MQTT Connection Failed
**Solusi:**
- Periksa koneksi internet
- Coba broker MQTT lokal untuk testing
- Check firewall settings

## Advanced Configuration

### 1. Mengubah Interval Pengiriman Data
```cpp
const unsigned long SENSOR_INTERVAL = 10000;  // 10 detik
const unsigned long WEATHER_INTERVAL = 120000; // 2 menit  
const unsigned long PREDICTION_INTERVAL = 60000; // 1 menit
```

### 2. Custom MQTT Broker
Jika ingin menggunakan broker sendiri:
```cpp
const char* mqtt_server = "your-broker.com";
const int mqtt_port = 1883;
const char* mqtt_user = "username";
const char* mqtt_password = "password";
```

### 3. Multiple Sensor Nodes
Untuk beberapa lokasi monitoring:
```cpp
const char* mqtt_client_id = "flood-sensor-lokasi1";
const char* sensor_topic = "flood-mitigation/lokasi1/sensors/data";
```

## Testing dengan Dashboard

### 1. Jalankan Dashboard
```bash
cd dashboard-arise
npm run dev
```

### 2. Akses Dashboard
- Buka browser: http://localhost:3000
- Lihat status koneksi di header
- Monitor data real-time dari sensor

### 3. Verifikasi Data
- Pastikan water level berubah saat sensor digerakkan
- Test flow sensor dengan menuangkan air
- Lihat prediksi flood risk di dashboard

## Maintenance

### 1. Pembersihan Rutin
- Bersihkan HC-SR04 dari debu/kotoran setiap minggu
- Bersihkan YF-S201 dari sedimen setiap bulan
- Periksa koneksi kabel secara berkala

### 2. Monitoring System
- Monitor Serial output secara berkala
- Check log error di dashboard
- Backup konfigurasi sistem

### 3. Update Firmware
- Backup konfigurasi sebelum update
- Test di lingkungan development dulu
- Update library Arduino secara berkala

Dengan panduan ini, Anda dapat menjalankan sistem monitoring banjir dengan hardware asli menggunakan Arduino IDE!
