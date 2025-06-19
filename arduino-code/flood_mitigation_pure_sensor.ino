/*
 * Arduino Code - Flood Mitigation System (Pure Sensor Version)
 * ============================================================
 * 
 * Sistem mitigasi banjir yang fokus HANYA pada sensor air:
 * - HC-SR04 (Ultrasonic) untuk water level
 * - YF-S201 (Water Flow) untuk flow rate
 * 
 * TANPA simulasi cuaca/rainfall - prediksi berdasarkan sensor saja.
 * 
 * Hardware yang dibutuhkan:
 * - ESP32 atau ESP8266
 * - Sensor HC-SR04 (Ultrasonic)
 * - Sensor YF-S201 (Water Flow)
 * - Resistor 10kΩ untuk pull-up (jika diperlukan)
 * 
 * Library yang dibutuhkan:
 * - WiFi (built-in)
 * - PubSubClient (MQTT)
 * - ArduinoJson
 */

#include <WiFi.h>           // For ESP32
// #include <ESP8266WiFi.h> // For ESP8266 - uncomment this and comment line above
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Global variables
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Sensor readings
float waterLevel = 0.0;
float flowRate = 0.0;
String currentRiskLevel = "LOW";

// Flow sensor variables
volatile int flowPulseCount = 0;
unsigned long lastFlowTime = 0;
float flowLiterPerHour = 0.0;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastPredictionSent = 0;
unsigned long lastMqttReconnect = 0;

// System status
bool systemInitialized = false;
int wifiReconnectAttempts = 0;
int mqttReconnectAttempts = 0;

void setup() {
    Serial.begin(115200);
    Serial.println();
    Serial.println("🌊 FLOOD MITIGATION SYSTEM - PURE SENSOR VERSION");
    Serial.println("================================================");
    Serial.println("💧 Sensors: Water Level + Flow Rate only");
    Serial.println("🚫 No weather simulation - sensor-based prediction");
    Serial.println();
    
    // Initialize pins
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
    
    // Setup flow sensor interrupt
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
    
    // Initialize WiFi and MQTT
    setupWiFi();
    setupMQTT();
    
    Serial.println("✅ System initialization complete!");
    Serial.println("📊 Starting sensor monitoring...");
    Serial.println();
    
    systemInitialized = true;
    lastFlowTime = millis();
}

void loop() {
    unsigned long currentTime = millis();
    
    // Maintain WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        handleWiFiReconnection();
    }
    
    // Maintain MQTT connection
    if (!mqttClient.connected()) {
        handleMqttReconnection();
    }
    
    mqttClient.loop();
    
    // Read sensors and send data
    if (currentTime - lastSensorRead >= SENSOR_READ_INTERVAL) {
        readSensors();
        sendSensorData();
        lastSensorRead = currentTime;
    }
    
    // Send prediction data
    if (currentTime - lastPredictionSent >= PREDICTION_INTERVAL) {
        sendPredictionData();
        lastPredictionSent = currentTime;
    }
    
    delay(100); // Small delay to prevent watchdog issues
}

void setupWiFi() {
    Serial.print("📶 Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.println("✅ WiFi connected successfully!");
        Serial.print("📍 IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 Signal Strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    } else {
        Serial.println();
        Serial.println("❌ WiFi connection failed!");
        Serial.println("🔄 Will retry in main loop...");
    }
}

void setupMQTT() {
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setKeepAlive(MQTT_KEEPALIVE);
    
    Serial.print("📡 Connecting to MQTT broker: ");
    Serial.println(MQTT_SERVER);
    
    if (connectMQTT()) {
        Serial.println("✅ MQTT connected successfully!");
    } else {
        Serial.println("❌ MQTT connection failed!");
        Serial.println("🔄 Will retry in main loop...");
    }
}

bool connectMQTT() {
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
        // Send initial system status
        DynamicJsonDocument statusDoc(512);
        statusDoc["timestamp"] = getTimestamp();
        statusDoc["device_id"] = MQTT_CLIENT_ID;
        statusDoc["status"] = "online";
        statusDoc["version"] = "pure-sensor-1.0";
        statusDoc["ip_address"] = WiFi.localIP().toString();
        statusDoc["rssi"] = WiFi.RSSI();
        
        String statusPayload;
        serializeJson(statusDoc, statusPayload);
        
        mqttClient.publish("flood-mitigation/system/status", statusPayload.c_str());
        return true;
    }
    return false;
}

void handleWiFiReconnection() {
    unsigned long currentTime = millis();
    
    if (currentTime - lastMqttReconnect > 30000) { // Try every 30 seconds
        wifiReconnectAttempts++;
        Serial.print("🔄 WiFi reconnection attempt ");
        Serial.print(wifiReconnectAttempts);
        Serial.println("...");
        
        WiFi.disconnect();
        delay(1000);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        
        lastMqttReconnect = currentTime;
        
        if (wifiReconnectAttempts >= 10) {
            Serial.println("🔄 Too many failed attempts, restarting...");
            ESP.restart();
        }
    }
}

void handleMqttReconnection() {
    unsigned long currentTime = millis();
    
    if (currentTime - lastMqttReconnect > 10000) { // Try every 10 seconds
        mqttReconnectAttempts++;
        Serial.print("🔄 MQTT reconnection attempt ");
        Serial.print(mqttReconnectAttempts);
        Serial.println("...");
        
        if (connectMQTT()) {
            Serial.println("✅ MQTT reconnected!");
            mqttReconnectAttempts = 0;
        }
        
        lastMqttReconnect = currentTime;
        
        if (mqttReconnectAttempts >= 5) {
            Serial.println("🔄 Too many MQTT failures, restarting...");
            ESP.restart();
        }
    }
}

void readSensors() {
    // Read water level from HC-SR04
    waterLevel = readWaterLevel();
    
    // Calculate flow rate from YF-S201
    flowRate = calculateFlowRate();
    
    // Determine risk level based on sensor readings only
    updateRiskLevel();
    
    // Print readings to serial
    Serial.println("📊 Sensor Readings:");
    Serial.println("   💧 Water Level: " + String(waterLevel, 1) + " cm");
    Serial.println("   🌊 Flow Rate: " + String(flowRate, 1) + " L/min");
    Serial.println("   ⚠️  Risk Level: " + currentRiskLevel);
    Serial.println();
}

float readWaterLevel() {
    // Send ultrasonic pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    // Read echo pulse
    long duration = pulseIn(ECHO_PIN, HIGH);
    
    // Calculate distance in cm
    float distance = (duration * 0.034) / 2;
    
    // Validate reading
    if (distance < MIN_DISTANCE_CM || distance > MAX_DISTANCE_CM) {
        Serial.println("⚠️  Warning: Invalid ultrasonic reading, using previous value");
        return waterLevel; // Return previous value if invalid
    }
    
    // Convert distance to water level
    // Water level = sensor height - distance to water surface
    float level = SENSOR_HEIGHT_CM - distance;
    
    // Ensure positive value
    return max(0.0f, level);
}

float calculateFlowRate() {
    unsigned long currentTime = millis();
    unsigned long timeDiff = currentTime - lastFlowTime;
    
    if (timeDiff >= 1000) { // Calculate every second
        // Disable interrupts while reading
        noInterrupts();
        int pulses = flowPulseCount;
        flowPulseCount = 0;
        interrupts();
        
        // Calculate flow rate in L/min
        // Formula: (pulses / time_in_sec) * (60 / pulses_per_liter)
        float timeInSeconds = timeDiff / 1000.0;
        float litersPerSecond = pulses / (FLOW_SENSOR_FACTOR * timeInSeconds);
        float litersPerMinute = litersPerSecond * 60;
        
        lastFlowTime = currentTime;
        return litersPerMinute;
    }
    
    return flowRate; // Return previous value if not time to calculate
}

void updateRiskLevel() {
    // Risk assessment based only on sensor data
    String newRiskLevel = "LOW";
    
    // Primary factor: Water level
    if (waterLevel > CRITICAL_WATER_LEVEL) {
        newRiskLevel = "CRITICAL";
    } else if (waterLevel > HIGH_WATER_LEVEL) {
        newRiskLevel = "HIGH";
    } else if (waterLevel > MEDIUM_WATER_LEVEL) {
        newRiskLevel = "MEDIUM";
    }
    
    // Secondary factor: Flow rate (can escalate risk)
    if (flowRate > CRITICAL_FLOW_RATE && newRiskLevel != "CRITICAL") {
        if (newRiskLevel == "LOW") newRiskLevel = "MEDIUM";
        else if (newRiskLevel == "MEDIUM") newRiskLevel = "HIGH";
    }
    
    // Update risk level
    currentRiskLevel = newRiskLevel;
}

void sendSensorData() {
    if (!mqttClient.connected()) return;
    
    DynamicJsonDocument doc(512);
    
    doc["timestamp"] = getTimestamp();
    doc["waterLevel"] = waterLevel;
    doc["flowRate"] = flowRate;
    doc["floodRisk"] = currentRiskLevel;
    
    String payload;
    serializeJson(doc, payload);
    
    if (mqttClient.publish(SENSOR_TOPIC, payload.c_str())) {
        Serial.println("📤 Sensor data sent to MQTT");
    } else {
        Serial.println("❌ Failed to send sensor data");
    }
}

void sendPredictionData() {
    if (!mqttClient.connected()) return;
    
    // Calculate flood probability based on sensor data only
    float probability = calculateFloodProbability();
    int timeToFlood = estimateTimeToFlood();
    String recommendation = getRecommendation();
    
    DynamicJsonDocument doc(1024);
    
    doc["timestamp"] = getTimestamp();
    doc["riskLevel"] = currentRiskLevel;
    doc["probability"] = probability;
    if (timeToFlood > 0) {
        doc["timeToFlood"] = timeToFlood;
    }
    doc["recommendation"] = recommendation;
    
    // Factor breakdown
    JsonObject factors = doc.createNestedObject("factors");
    factors["waterLevel"] = min(100.0f, (float)((waterLevel / CRITICAL_WATER_LEVEL) * 100));
    factors["flowRate"] = min(100.0f, (float)((flowRate / CRITICAL_FLOW_RATE) * 100));
    
    String payload;
    serializeJson(doc, payload);
    
    if (mqttClient.publish(PREDICTION_TOPIC, payload.c_str())) {
        Serial.println("🔮 Prediction data sent to MQTT");
    } else {
        Serial.println("❌ Failed to send prediction data");
    }
    
    // Send Telegram alert for high-risk situations
    if (currentRiskLevel == "HIGH" || currentRiskLevel == "CRITICAL") {
        sendTelegramAlert();
    }
}

float calculateFloodProbability() {
    // Calculate probability based on sensor thresholds
    float waterFactor = min(100.0f, (float)((waterLevel / CRITICAL_WATER_LEVEL) * 100));
    float flowFactor = min(100.0f, (float)((flowRate / CRITICAL_FLOW_RATE) * 100));
    
    // Weighted average (water level is more critical)
    return (waterFactor * 0.7) + (flowFactor * 0.3);
}

int estimateTimeToFlood() {
    if (currentRiskLevel == "CRITICAL") {
        return random(5, 15); // 5-15 minutes
    } else if (currentRiskLevel == "HIGH") {
        return random(30, 90); // 30-90 minutes
    }
    return 0; // No immediate flood risk
}

String getRecommendation() {
    if (currentRiskLevel == "CRITICAL") {
        return "IMMEDIATE EVACUATION REQUIRED! Move to higher ground now!";
    } else if (currentRiskLevel == "HIGH") {
        return "Prepare for evacuation. Monitor conditions closely.";
    } else if (currentRiskLevel == "MEDIUM") {
        return "Stay alert. Avoid low-lying areas.";
    } else {
        return "Conditions normal. Continue monitoring.";
    }
}

void sendTelegramAlert() {
    if (!mqttClient.connected()) return;
    
    String message = "🚨 FLOOD ALERT 🚨\n\n";
    message += "📍 Location: " + String(MQTT_CLIENT_ID) + "\n";
    message += "⚠️ Risk Level: " + currentRiskLevel + "\n";
    message += "💧 Water Level: " + String(waterLevel, 1) + " cm\n";
    message += "🌊 Flow Rate: " + String(flowRate, 1) + " L/min\n";
    message += "🕒 Time: " + getTimestamp() + "\n\n";
    message += "💡 " + getRecommendation();
    
    DynamicJsonDocument alertDoc(1024);
    alertDoc["message"] = message;
    alertDoc["riskLevel"] = currentRiskLevel;
    alertDoc["timestamp"] = getTimestamp();
    
    String alertPayload;
    serializeJson(alertDoc, alertPayload);
    
    if (mqttClient.publish("flood-mitigation/alerts/telegram", alertPayload.c_str())) {
        Serial.println("📱 Telegram alert sent");
    } else {
        Serial.println("❌ Failed to send Telegram alert");
    }
}

String getTimestamp() {
    return String(millis()); // Simple timestamp, can be improved with NTP
}

void flowPulseCounter() {
    flowPulseCount++;
}
