/*
 * Configuration File - Flood Mitigation System (Pure Sensor Version)
 * ==================================================================
 * 
 * Konfigurasi untuk sistem yang fokus HANYA pada sensor air.
 * Sesuaikan nilai-nilai di bawah ini dengan setup hardware Anda.
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

// MQTT Topics (no weather topic needed)
const char* SENSOR_TOPIC = "flood-mitigation/sensors/data";
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
// Flood Threshold Configuration (sensor-based only)
// ========================================
#define NORMAL_WATER_LEVEL 15.0               // Normal water level (cm)
#define MEDIUM_WATER_LEVEL 20.0               // Medium risk threshold (cm)
#define HIGH_WATER_LEVEL 30.0                 // High risk threshold (cm)
#define CRITICAL_WATER_LEVEL 40.0             // Critical risk threshold (cm)

#define NORMAL_FLOW_RATE 10.0                 // Normal flow rate (L/min)
#define MEDIUM_FLOW_RATE 20.0                 // Medium risk threshold (L/min)
#define HIGH_FLOW_RATE 30.0                   // High risk threshold (L/min)
#define CRITICAL_FLOW_RATE 40.0               // Critical risk threshold (L/min)

// ========================================
// Timing Configuration (milliseconds)
// ========================================
#define SENSOR_READ_INTERVAL 5000             // Baca sensor setiap 5 detik
#define PREDICTION_INTERVAL 30000             // Prediksi setiap 30 detik
#define MQTT_KEEPALIVE 15                     // MQTT keepalive dalam detik

// ========================================
// Default Values
// ========================================
#define DEFAULT_WATER_LEVEL 10.0              // Default water level if sensor fails
#define DEFAULT_FLOW_RATE 5.0                 // Default flow rate if sensor fails

// ========================================
// Telegram Configuration (Optional)
// ========================================
// Telegram alerts akan dikirim melalui MQTT topic
// Dashboard akan menangani pengiriman ke Telegram Bot

#define ENABLE_TELEGRAM_ALERTS true           // Enable/disable Telegram alerts
#define ALERT_COOLDOWN_MINUTES 15             // Minimum time between alerts (minutes)

// ========================================
// Debug Configuration
// ========================================
#define DEBUG_MODE true                       // Enable debug output
#define DEBUG_SENSORS true                    // Debug sensor readings
#define DEBUG_MQTT true                       // Debug MQTT messages
#define DEBUG_PREDICTION true                 // Debug prediction calculations

// ========================================
// System Configuration
// ========================================
#define MAX_WIFI_RECONNECT_ATTEMPTS 10       // Max WiFi reconnection attempts
#define MAX_MQTT_RECONNECT_ATTEMPTS 5        // Max MQTT reconnection attempts
#define WATCHDOG_TIMEOUT_SEC 30               // Watchdog timeout (seconds)

#endif // CONFIG_H
