/*
 * Configuration File - Flood Mitigation System
 * ============================================
 * 
 * Sesuaikan nilai-nilai di bawah ini dengan setup hardware Anda
 */

#ifndef CONFIG_H
#define CONFIG_H

// ========================================
// WiFi Configuration
// ========================================
const char* WIFI_SSID = "12345678";           // Ganti dengan nama WiFi Anda
const char* WIFI_PASSWORD = "12345678";       // Ganti dengan password WiFi Anda

// ========================================
// Pin Configuration
// ========================================
#define TRIG_PIN 2                            // HC-SR04 Trigger pin
#define ECHO_PIN 4                            // HC-SR04 Echo pin  
#define FLOW_SENSOR_PIN 5                     // YF-S201 Signal pin

// ========================================
// MQTT Configuration
// ========================================
const char* MQTT_SERVER = "broker.hivemq.com"; // MQTT Broker
const int MQTT_PORT = 1883;                     // MQTT Port
const char* MQTT_CLIENT_ID = "flood-sensor-001"; // Unique client ID

// MQTT Topics
const char* SENSOR_TOPIC = "flood-mitigation/sensors/data";
const char* WEATHER_TOPIC = "flood-mitigation/weather/data"; 
const char* PREDICTION_TOPIC = "flood-mitigation/prediction/data";

// ========================================
// Sensor Calibration
// ========================================

// HC-SR04 Configuration
#define SENSOR_HEIGHT_CM 100.0                // Tinggi sensor dari dasar (cm)
#define MIN_DISTANCE_CM 2.0                   // Jarak minimum yang bisa diukur
#define MAX_DISTANCE_CM 400.0                 // Jarak maximum yang bisa diukur

// YF-S201 Configuration  
#define FLOW_SENSOR_FACTOR 450.0              // Pulses per liter (YF-S201 = 450)
// Untuk sensor lain:
// YF-B1: 660 pulses/liter
// YF-B2: 450 pulses/liter
// YF-S402: 5880 pulses/liter

// ========================================
// Timing Configuration (milliseconds)
// ========================================
#define SENSOR_READ_INTERVAL 5000             // Baca sensor setiap 5 detik
#define WEATHER_UPDATE_INTERVAL 60000         // Update cuaca setiap 1 menit
#define PREDICTION_INTERVAL 30000             // Prediksi setiap 30 detik
#define MQTT_KEEPALIVE 15                     // MQTT keepalive dalam detik

// ========================================
// Flood Risk Thresholds (cm)
// ========================================
#define RISK_MEDIUM_THRESHOLD 20.0            // Level MEDIUM (cm)
#define RISK_HIGH_THRESHOLD 40.0              // Level HIGH (cm) 
#define RISK_CRITICAL_THRESHOLD 60.0          // Level CRITICAL (cm)

// ========================================
// Flow Rate Thresholds (L/min)
// ========================================
#define FLOW_NORMAL_MAX 10.0                  // Flow normal maksimum
#define FLOW_HIGH_THRESHOLD 25.0              // Flow tinggi threshold

// ========================================
// Weather Configuration (No API Required)
// ========================================
#define USE_WEATHER_API false                 // Disable weather API
#define USE_DUMMY_WEATHER true                // Use simulated weather data
#define SIMULATE_RAIN_PROBABILITY 30          // 30% chance of rain in simulation

// Manual Weather Settings (if you know local conditions)
const float DEFAULT_TEMPERATURE = 27.0;      // Default temperature (°C)
const float DEFAULT_HUMIDITY = 70.0;         // Default humidity (%)
const float DEFAULT_RAINFALL = 0.0;          // Default rainfall (mm/h)

// ========================================
// System Configuration
// ========================================
#define SERIAL_BAUD_RATE 115200               // Serial monitor baud rate
#define WIFI_TIMEOUT_MS 20000                 // WiFi connection timeout
#define MQTT_RETRY_DELAY 5000                 // MQTT reconnection delay

// Debug Configuration
#define DEBUG_SENSORS true                    // Print sensor readings
#define DEBUG_MQTT true                       // Print MQTT messages
#define DEBUG_WIFI true                       // Print WiFi status

// ========================================
// Advanced Configuration
// ========================================

// Sensor Smoothing (moving average)
#define ENABLE_SENSOR_SMOOTHING true          // Enable sensor data smoothing
#define SMOOTHING_SAMPLES 5                   // Number of samples for averaging

// Power Saving
#define ENABLE_DEEP_SLEEP false               // Enable deep sleep (experimental)
#define SLEEP_DURATION_SEC 30                 // Sleep duration in seconds

// Offline Mode
#define ENABLE_LOCAL_LOGGING true             // Enable local data logging
#define MAX_LOG_ENTRIES 100                   // Maximum log entries in memory

// System Monitoring
#define ENABLE_WATCHDOG true                  // Enable watchdog timer
#define WATCHDOG_TIMEOUT_SEC 30               // Watchdog timeout

// Network Configuration
#define ENABLE_STATIC_IP false                // Use static IP instead of DHCP
const IPAddress STATIC_IP(192, 168, 1, 100); // Static IP address
const IPAddress GATEWAY(192, 168, 1, 1);     // Gateway address
const IPAddress SUBNET(255, 255, 255, 0);    // Subnet mask

// ========================================
// Telegram Bot Configuration
// ========================================
const String TELEGRAM_BOT_TOKEN = "7781266122:AAGsKP_RqTLrIKoxmFsOcPRiidv-hCfDg1M";     // Bot token dari @BotFather
const String TELEGRAM_CHAT_ID = "1187001409";        // Chat ID Anda
const String TELEGRAM_API_URL = "https://api.telegram.org/bot";

// Telegram Alert Settings
#define ENABLE_TELEGRAM_ALERTS true          // Enable/disable Telegram notifications
#define ALERT_COOLDOWN_MINUTES 10            // Minimum interval between alerts (minutes)
#define CRITICAL_ALERT_ONLY false            // Only send for CRITICAL alerts (true) or HIGH+ (false)
#define ENABLE_LOCATION_SHARING false        // Share location in alerts (optional)

// Location Settings (optional)
const float LOCATION_LATITUDE = -6.302536;   // Ganti dengan koordinat lokasi Anda
const float LOCATION_LONGITUDE = 107.300224; // Ganti dengan koordinat lokasi Anda
const String LOCATION_NAME = "Flood Monitoring Station";

#endif // CONFIG_H

/*
 * PANDUAN KONFIGURASI:
 * 
 * 1. WiFi Setup:
 *    - Ganti WIFI_SSID dan WIFI_PASSWORD dengan kredensial WiFi Anda
 *    - Pastikan sinyal WiFi kuat di lokasi instalasi
 * 
 * 2. Pin Configuration:
 *    - Sesuaikan pin jika menggunakan board selain ESP32
 *    - Pastikan pin yang dipilih mendukung interrupt (untuk flow sensor)
 * 
 * 3. Sensor Calibration:
 *    - SENSOR_HEIGHT_CM: Ukur jarak dari sensor ke dasar saluran
 *    - FLOW_SENSOR_FACTOR: Sesuaikan dengan spesifikasi sensor flow Anda
 * 
 * 4. Threshold Settings:
 *    - Sesuaikan threshold dengan kondisi lokal Anda
 *    - Test dengan kondisi cuaca berbeda untuk optimasi
 * 
 * 5. Weather API (Opsional):
 *    - Daftar di openweathermap.org untuk API key gratis
 *    - Ganti WEATHER_CITY dengan kota Anda
 * 
 * CONTOH KONFIGURASI UNTUK KONDISI BERBEDA:
 * 
 * Saluran Kecil (got rumah):
 * #define RISK_MEDIUM_THRESHOLD 5.0
 * #define RISK_HIGH_THRESHOLD 10.0  
 * #define RISK_CRITICAL_THRESHOLD 15.0
 * 
 * Sungai Besar:
 * #define RISK_MEDIUM_THRESHOLD 50.0
 * #define RISK_HIGH_THRESHOLD 100.0
 * #define RISK_CRITICAL_THRESHOLD 150.0
 */
