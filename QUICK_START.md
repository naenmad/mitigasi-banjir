# Quick Start Guide - Arduino Setup

## 📋 Checklist Hardware
- [check] ESP32 atau ESP8266 board
- [check] HC-SR04 Ultrasonic Sensor
- [check] YF-S201 Water Flow Sensor  
- [check] Kabel jumper dan breadboard
- [check] Kabel USB untuk programming

## 🔧 Setup Arduino IDE (5 Menit)

### 1. Install Arduino IDE
```
Download: https://www.arduino.cc/en/software
Install Arduino IDE 2.x (latest version)
```

### 2. Install ESP32 Board
1. **File** → **Preferences**
2. Tambahkan URL ini di "Additional Board Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
3. **Tools** → **Board** → **Boards Manager**
4. Cari "ESP32" → Install "ESP32 by Espressif Systems"

### 3. Install Libraries
**Tools** → **Manage Libraries**, cari dan install:
- `PubSubClient` by Nick O'Leary
- `ArduinoJson` by Benoit Blanchon

## 🔌 Wiring (10 Menit)

### Koneksi Cepat:
```
ESP32 Pin → Sensor
GPIO 2    → HC-SR04 Trig
GPIO 4    → HC-SR04 Echo
GPIO 5    → YF-S201 Signal (Kuning)
5V        → VCC Kedua Sensor (Merah)
GND       → GND Kedua Sensor (Hitam)
```

### Diagram Visual:
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    ESP32    │    │   HC-SR04   │    │   YF-S201   │
│             │    │             │    │             │
│   GPIO2 ────┼────┤ Trig        │    │             │
│   GPIO4 ────┼────┤ Echo        │    │             │
│   GPIO5 ────┼────┼─────────────┼────┤ Signal      │
│     5V  ────┼────┤ VCC         ┼────┤ VCC         │
│    GND  ────┼────┤ GND         ┼────┤ GND         │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📝 Konfigurasi Code (3 Menit)

### 1. Buka File
- Buka `flood_mitigation_system_v2.ino` di Arduino IDE

### 2. Edit config.h - WAJIB DIUBAH:
```cpp
// WiFi credentials - GANTI INI!
const char* WIFI_SSID = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

// Kalibrasi sensor - SESUAIKAN!
#define SENSOR_HEIGHT_CM 100.0  // Tinggi sensor dari dasar (cm)
```

### 3. Board Settings
**Tools** menu:
- **Board**: "ESP32 Dev Module"
- **Port**: Pilih port COM yang muncul
- **Upload Speed**: 115200

## 🚀 Upload & Test (2 Menit)

### 1. Upload Code
1. Tekan tombol **Upload** (→)
2. Tunggu "Done uploading"

### 2. Buka Serial Monitor
1. **Tools** → **Serial Monitor**
2. Set baud rate: **115200**
3. Lihat output:

### ✅ Output Yang Benar:
```
Flood Mitigation System Started
================================
Connecting to WiFi: YOUR_WIFI_NAME
..
WiFi connected!
IP address: 192.168.1.100
Attempting MQTT connection...connected
Sensor Height: 100.0 cm
Flow Sensor Factor: 450.0 pulses/liter
================================

Sensor Readings:
================
Water Level: 15.2 cm
Flow Rate: 3.4 L/min

✓ Sensor data published successfully
✓ Weather data published successfully  
✓ Flood prediction published successfully
```

## 🔍 Testing Sensor

### Test HC-SR04:
1. Gerakkan tangan di depan sensor
2. Lihat perubahan "Water Level" di Serial Monitor
3. Nilai harus berubah sesuai jarak

### Test YF-S201:
1. Putar impeller sensor secara manual atau alirkan air
2. Lihat "Flow Rate" berubah
3. "Flow pulses" harus bertambah

## 🎯 Dashboard Connection

### 1. Jalankan Dashboard
```bash
cd dashboard-arise
npm run dev
```

### 2. Buka Browser
- URL: `http://localhost:3000`
- Lihat status "Connected" di header
- Data sensor harus muncul real-time

## ❌ Troubleshooting Cepat

### WiFi Tidak Connect?
```cpp
// Pastikan SSID dan password benar di config.h
const char* WIFI_SSID = "NAMA_WIFI_EXACT";
const char* WIFI_PASSWORD = "PASSWORD_EXACT";
```

### Sensor Tidak Terbaca?
- **HC-SR04**: Periksa wiring Trig (GPIO2) dan Echo (GPIO4)
- **YF-S201**: Periksa wiring Signal (GPIO5)
- **Power**: Pastikan 5V dan GND tersambung

### Upload Error?
- Tekan tombol **BOOT** pada ESP32 saat upload
- Coba port USB yang berbeda
- Install driver CP2102/CH340

### MQTT Tidak Connect?
- Periksa koneksi internet
- Restart ESP32
- Cek Serial Monitor untuk error

## 📱 Monitoring Status

### Serial Monitor Output:
```
✓ = Berhasil
✗ = Gagal
Warning = Perlu perhatian
```

### Dashboard Indicators:
- 🟢 **Connected**: System OK
- 🔴 **Disconnected**: Ada masalah
- 📊 **Charts**: Data real-time
- ⚠️ **Alerts**: Peringatan banjir

## 🎛️ Advanced Settings (Optional)

### Ubah Interval Pengiriman:
```cpp
#define SENSOR_READ_INTERVAL 10000  // 10 detik
#define WEATHER_UPDATE_INTERVAL 120000  // 2 menit
```

### Ubah Threshold Banjir:
```cpp
#define RISK_MEDIUM_THRESHOLD 15.0   // 15cm = Medium
#define RISK_HIGH_THRESHOLD 30.0     // 30cm = High  
#define RISK_CRITICAL_THRESHOLD 45.0 // 45cm = Critical
```

### Custom MQTT Broker:
```cpp
const char* MQTT_SERVER = "your-broker.com";
const int MQTT_PORT = 1883;
```

## ✅ Success Checklist

- [ ] Arduino IDE setup completed
- [ ] Libraries installed
- [ ] Wiring completed correctly
- [ ] WiFi credentials configured
- [ ] Code uploaded successfully
- [ ] Serial Monitor shows sensor readings
- [ ] Dashboard shows "Connected" status
- [ ] Real-time data appears on dashboard
- [ ] Sensor testing successful

## 📞 Need Help?

1. **Check Serial Monitor** untuk error messages
2. **Verify Wiring** dengan diagram
3. **Test Individual Components** satu per satu
4. **Check WiFi Signal** di lokasi instalasi
5. **Restart Everything** - ESP32, Router, PC

---
**🎉 Congratulations!** Sistem monitoring banjir Anda sudah siap bekerja!
