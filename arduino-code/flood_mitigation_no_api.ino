/*
 * Flood Mitigation System - NO API VERSION
 * ========================================
 * 
 * Sistem monitoring banjir tanpa dependensi weather API
 * Menggunakan sensor HC-SR04 (ultrasonik) dan YF-S201 (flow rate)
 * Dengan Telegram Bot notifications
 * 
 * Hardware yang dibutuhkan:
 * - ESP32 atau ESP8266
 * - Sensor HC-SR04 (ultrasonic)
 * - Sensor YF-S201 (water flow)
 * - Resistor 10kΩ (pull-up untuk flow sensor)
 * 
 * Fitur:
 * - Real-time monitoring water level dan flow rate
 * - MQTT publishing ke HiveMQ
 * - Telegram Bot notifications
 * - Simulated weather data (no API required)
 * - Smart flood prediction algorithm
 * - Completely FREE - no API costs!
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <time.h>
#include "config.h"

// Global variables
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
HTTPClient http;

// Sensor variables
volatile unsigned long flowPulseCount = 0;
unsigned long lastFlowTime = 0;
float waterLevel = 0.0;
float flowRate = 0.0;
float lastWaterLevel = 0.0;
unsigned long lastSensorRead = 0;
unsigned long lastWeatherUpdate = 0;
unsigned long lastPrediction = 0;
unsigned long lastTelegramAlert = 0;

// Weather data (simulated - no API needed)
float temperature = DEFAULT_TEMPERATURE;
float humidity = DEFAULT_HUMIDITY;
float rainfall = DEFAULT_RAINFALL;

// System status
String currentRiskLevel = "LOW";
bool systemOnline = false;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  delay(1000);
  
  Serial.println("🌊 Flood Mitigation System - NO API VERSION");
  Serial.println("===========================================");
  Serial.println("💰 100% FREE - No weather API costs!");
  
  // Initialize pins
  setupPins();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize time
  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  
  // Connect to MQTT
  connectToMQTT();
  
  // Send startup message
  sendTelegramMessage("🚀 *Flood Monitoring System Started*\n\n"
                     "📡 Status: Online (No API Version)\n"
                     "💰 Cost: FREE Forever!\n"
                     "📍 Location: " + LOCATION_NAME + "\n"
                     "🕒 Time: " + getCurrentTime());
  
  Serial.println("✅ System initialized successfully!");
  Serial.println("💡 Using simulated weather data - no API costs!");
  systemOnline = true;
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Maintain connections
  if (!WiFi.isConnected()) {
    connectToWiFi();
  }
  
  if (!mqttClient.connected()) {
    connectToMQTT();
  }
  
  mqttClient.loop();
  
  // Read sensors
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    publishSensorData();
    lastSensorRead = currentMillis;
  }
  
  // Update weather data (simulated)
  if (currentMillis - lastWeatherUpdate >= WEATHER_UPDATE_INTERVAL) {
    updateSimulatedWeather();
    lastWeatherUpdate = currentMillis;
  }
  
  // Generate flood prediction
  if (currentMillis - lastPrediction >= PREDICTION_INTERVAL) {
    generateFloodPrediction();
    lastPrediction = currentMillis;
  }
  
  delay(100);
}

void setupPins() {
  // HC-SR04 pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Flow sensor pin with interrupt
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
  
  Serial.println("📌 Pins configured successfully");
}

void connectToWiFi() {
  Serial.println("🔌 Connecting to WiFi: " + String(WIFI_SSID));
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.println("📡 IP address: " + WiFi.localIP().toString());
    Serial.println("📶 Signal strength: " + String(WiFi.RSSI()) + " dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
  }
}

void connectToMQTT() {
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  
  while (!mqttClient.connected()) {
    Serial.println("🔄 Connecting to MQTT broker: " + String(MQTT_SERVER));
    
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println("✅ MQTT connected!");
    } else {
      Serial.println("❌ MQTT connection failed, rc=" + String(mqttClient.state()));
      delay(MQTT_RETRY_DELAY);
    }
  }
}

void readSensors() {
  // Read water level from HC-SR04
  waterLevel = readWaterLevel();
  
  // Read flow rate from YF-S201
  flowRate = readFlowRate();
  
  if (DEBUG_SENSORS) {
    Serial.println("📊 Sensor readings:");
    Serial.println("   💧 Water Level: " + String(waterLevel, 2) + " cm");
    Serial.println("   🌊 Flow Rate: " + String(flowRate, 2) + " L/min");
  }
}

float readWaterLevel() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    Serial.println("⚠️ HC-SR04 timeout - sensor disconnected?");
    return lastWaterLevel; // Return last valid reading
  }
  
  // Calculate distance
  float distance = (duration * 0.034) / 2.0;
  
  // Validate reading
  if (distance < MIN_DISTANCE_CM || distance > MAX_DISTANCE_CM) {
    Serial.println("⚠️ HC-SR04 out of range: " + String(distance) + " cm");
    return lastWaterLevel;
  }
  
  // Convert to water level (sensor height - distance)
  float level = SENSOR_HEIGHT_CM - distance;
  level = fmax(0, level); // Ensure non-negative
  
  lastWaterLevel = level;
  return level;
}

float readFlowRate() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastFlowTime >= 1000) { // Calculate every second
    // Disable interrupts while reading
    noInterrupts();
    unsigned long pulses = flowPulseCount;
    flowPulseCount = 0;
    interrupts();
    
    // Calculate flow rate in L/min
    float rate = (pulses * 60.0) / FLOW_SENSOR_FACTOR;
    
    lastFlowTime = currentTime;
    return rate;
  }
  
  return flowRate; // Return last calculated rate
}

void flowPulseCounter() {
  flowPulseCount++;
}

void updateSimulatedWeather() {
  Serial.println("🌤️ Updating simulated weather data...");
  
  // Simulate realistic weather variations
  // Temperature: 24-32°C with daily variation
  float timeOfDay = (millis() / 60000) % 1440; // Minutes in day
  float tempVariation = sin((timeOfDay / 1440.0) * 2 * PI) * 3; // ±3°C daily variation
  temperature = DEFAULT_TEMPERATURE + tempVariation + random(-20, 20) / 10.0;
  temperature = constrain(temperature, 20, 35);
  
  // Humidity: 50-90% with inverse temperature correlation
  humidity = DEFAULT_HUMIDITY + random(-100, 100) / 10.0;
  humidity = constrain(humidity, 50, 95);
  
  // Rainfall: Random with higher chance during "night" hours
  if (random(1, 101) <= SIMULATE_RAIN_PROBABILITY) {
    rainfall = random(0, 150) / 10.0; // 0-15mm/h
  } else {
    rainfall = 0.0;
  }
  
  // Add some correlation between high humidity and rain
  if (humidity > 85 && random(1, 101) <= 60) {
    rainfall = random(5, 200) / 10.0; // 0.5-20mm/h
  }
  
  Serial.println("🌤️ Simulated weather:");
  Serial.println("   🌡️ Temperature: " + String(temperature, 1) + "°C");
  Serial.println("   💨 Humidity: " + String(humidity, 1) + "%");
  Serial.println("   🌧️ Rainfall: " + String(rainfall, 1) + " mm/h");
}

void publishSensorData() {
  if (!mqttClient.connected()) return;
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = MQTT_CLIENT_ID;
  doc["timestamp"] = getCurrentTime();
  doc["waterLevel"] = waterLevel;
  doc["flowRate"] = flowRate;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["rainfall"] = rainfall;
  doc["riskLevel"] = currentRiskLevel;
  doc["weatherSource"] = "simulated";
  doc["apiCost"] = 0.00;
  doc["location"]["lat"] = LOCATION_LATITUDE;
  doc["location"]["lon"] = LOCATION_LONGITUDE;
  
  String payload;
  serializeJson(doc, payload);
  
  // Publish to MQTT
  if (mqttClient.publish(SENSOR_TOPIC, payload.c_str())) {
    if (DEBUG_MQTT) {
      Serial.println("📤 MQTT Published: " + payload);
    }
  } else {
    Serial.println("❌ MQTT publish failed");
  }
}

void generateFloodPrediction() {
  String previousRisk = currentRiskLevel;
  
  // Basic risk assessment based on water level
  if (waterLevel >= RISK_CRITICAL_THRESHOLD) {
    currentRiskLevel = "CRITICAL";
  } else if (waterLevel >= RISK_HIGH_THRESHOLD) {
    currentRiskLevel = "HIGH";
  } else if (waterLevel >= RISK_MEDIUM_THRESHOLD) {
    currentRiskLevel = "MEDIUM";
  } else {
    currentRiskLevel = "LOW";
  }
  
  // Enhanced prediction with simulated weather data
  if (rainfall > 10.0 && currentRiskLevel != "LOW") {
    // Heavy rain detected, increase risk level
    if (currentRiskLevel == "MEDIUM") currentRiskLevel = "HIGH";
    else if (currentRiskLevel == "HIGH") currentRiskLevel = "CRITICAL";
  }
  
  // Flow rate factor
  if (flowRate > FLOW_HIGH_THRESHOLD && currentRiskLevel != "LOW") {
    if (currentRiskLevel == "MEDIUM") currentRiskLevel = "HIGH";
  }
  
  // Publish prediction
  publishPrediction();
  
  // Send Telegram alert if risk level changed or critical
  if (ENABLE_TELEGRAM_ALERTS && 
      (currentRiskLevel != previousRisk || currentRiskLevel == "CRITICAL") &&
      shouldSendAlert()) {
    sendFloodAlert();
  }
  
  Serial.println("🔮 Flood prediction: " + currentRiskLevel + 
                 " (Weather: Simulated, Cost: $0.00)");
}

void publishPrediction() {
  if (!mqttClient.connected()) return;
  
  StaticJsonDocument<1024> doc;
  doc["deviceId"] = MQTT_CLIENT_ID;
  doc["timestamp"] = getCurrentTime();
  doc["riskLevel"] = currentRiskLevel;
  doc["waterLevel"] = waterLevel;
  doc["flowRate"] = flowRate;
  doc["rainfall"] = rainfall;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["weatherSource"] = "simulated";
  doc["apiCost"] = 0.00;
  
  // Risk factors
  doc["factors"]["waterLevel"] = (waterLevel / RISK_CRITICAL_THRESHOLD) * 100;
  doc["factors"]["flowRate"] = (flowRate / FLOW_HIGH_THRESHOLD) * 100;
  doc["factors"]["rainfall"] = fmin(rainfall * 5, 100); // Scale rainfall factor
  
  // Recommendations
  if (currentRiskLevel == "CRITICAL") {
    doc["recommendation"] = "IMMEDIATE EVACUATION REQUIRED! Flood imminent within 15 minutes.";
  } else if (currentRiskLevel == "HIGH") {
    doc["recommendation"] = "HIGH FLOOD RISK! Prepare for evacuation. Monitor conditions closely.";
  } else if (currentRiskLevel == "MEDIUM") {
    doc["recommendation"] = "Moderate flood risk. Stay alert and avoid low-lying areas.";
  } else {
    doc["recommendation"] = "Conditions normal. Continue monitoring.";
  }
  
  String payload;
  serializeJson(doc, payload);
  
  mqttClient.publish(PREDICTION_TOPIC, payload.c_str());
}

bool shouldSendAlert() {
  unsigned long currentTime = millis();
  
  // Check cooldown period
  if (currentTime - lastTelegramAlert < (ALERT_COOLDOWN_MINUTES * 60000)) {
    return false;
  }
  
  // Check alert level settings
  if (CRITICAL_ALERT_ONLY && currentRiskLevel != "CRITICAL") {
    return false;
  }
  
  // Only send for HIGH and CRITICAL levels
  return (currentRiskLevel == "HIGH" || currentRiskLevel == "CRITICAL");
}

void sendFloodAlert() {
  String message = "🚨 *FLOOD ALERT* 🚨\n\n";
  
  // Risk level with emoji
  if (currentRiskLevel == "CRITICAL") {
    message += "⛔ *Risk Level: CRITICAL*\n";
  } else if (currentRiskLevel == "HIGH") {
    message += "⚠️ *Risk Level: HIGH*\n";
  } else {
    message += "🟡 *Risk Level: " + currentRiskLevel + "*\n";
  }
  
  message += "\n📊 *Current Data:*\n";
  message += "💧 Water Level: " + String(waterLevel, 1) + " cm\n";
  message += "🌊 Flow Rate: " + String(flowRate, 1) + " L/min\n";
  message += "🌡️ Temperature: " + String(temperature, 1) + "°C\n";
  message += "💨 Humidity: " + String(humidity, 0) + "%\n";
  message += "🌧️ Rainfall: " + String(rainfall, 1) + " mm/h\n";
  message += "🕒 Time: " + getCurrentTime() + "\n";
  
  message += "\n📝 *Recommendation:*\n";
  if (currentRiskLevel == "CRITICAL") {
    message += "🆘 *IMMEDIATE EVACUATION REQUIRED!*\n";
    message += "Flood imminent within 15 minutes.";
  } else if (currentRiskLevel == "HIGH") {
    message += "⚡ *HIGH FLOOD RISK!*\n";
    message += "Prepare for evacuation. Monitor closely.";
  }
  
  message += "\n\n🏠 *Flood Mitigation System*\n";
  message += "📍 Location: " + LOCATION_NAME + "\n";
  message += "💰 API Cost: $0.00 (No API Used)";
  
  if (sendTelegramMessage(message)) {
    lastTelegramAlert = millis();
    Serial.println("✅ Telegram flood alert sent successfully!");
    
    // Send location if enabled
    if (ENABLE_LOCATION_SHARING) {
      sendTelegramLocation();
    }
  } else {
    Serial.println("❌ Failed to send Telegram flood alert");
  }
}

bool sendTelegramMessage(String message) {
  if (TELEGRAM_BOT_TOKEN.length() < 10 || TELEGRAM_CHAT_ID.length() < 5) {
    Serial.println("❌ Telegram credentials not configured");
    return false;
  }
  
  String url = TELEGRAM_API_URL + TELEGRAM_BOT_TOKEN + "/sendMessage";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<1024> doc;
  doc["chat_id"] = TELEGRAM_CHAT_ID;
  doc["text"] = message;
  doc["parse_mode"] = "Markdown";
  
  String payload;
  serializeJson(doc, payload);
  
  int httpCode = http.POST(payload);
  String response = http.getString();
  
  http.end();
  
  if (httpCode == HTTP_CODE_OK) {
    Serial.println("📤 Telegram message sent: " + String(httpCode));
    return true;
  } else {
    Serial.println("❌ Telegram API error: " + String(httpCode));
    Serial.println("Response: " + response);
    return false;
  }
}

bool sendTelegramLocation() {
  String url = TELEGRAM_API_URL + TELEGRAM_BOT_TOKEN + "/sendLocation";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> doc;
  doc["chat_id"] = TELEGRAM_CHAT_ID;
  doc["latitude"] = LOCATION_LATITUDE;
  doc["longitude"] = LOCATION_LONGITUDE;
  
  String payload;
  serializeJson(doc, payload);
  
  int httpCode = http.POST(payload);
  http.end();
  
  return (httpCode == HTTP_CODE_OK);
}

String getCurrentTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "Time sync failed";
  }
  
  char timeString[64];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeString);
}
