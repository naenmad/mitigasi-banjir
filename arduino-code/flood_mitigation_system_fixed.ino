#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <time.h>  // Tambahan untuk timestamp
#include "config.h"  // Include configuration file

// Global variables
WiFiClient espClient;
PubSubClient client(espClient);

// Flow sensor variables
volatile int flowPulseCount = 0;
float flowRate = 0.0;
unsigned long oldTime = 0;

// Sensor data
float waterLevel = 0.0;
float rainfall = 0.0;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastWeatherRead = 0;
unsigned long lastPrediction = 0;

// Data smoothing arrays (if enabled)
#if ENABLE_SENSOR_SMOOTHING
float waterLevelSamples[SMOOTHING_SAMPLES];
float flowRateSamples[SMOOTHING_SAMPLES];
int sampleIndex = 0;
bool samplesReady = false;
#endif

// Weather API URL (constructed from config)
String weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + 
                   WEATHER_CITY + "," + WEATHER_COUNTRY + 
                   "&appid=" + WEATHER_API_KEY + "&units=metric";

// NTP Server untuk timestamp
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 25200; // GMT+7 untuk Indonesia (7*3600)
const int daylightOffset_sec = 0;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  
  // Attach interrupt for flow sensor
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
  
  // Initialize smoothing arrays
  #if ENABLE_SENSOR_SMOOTHING
  for (int i = 0; i < SMOOTHING_SAMPLES; i++) {
    waterLevelSamples[i] = 0.0;
    flowRateSamples[i] = 0.0;
  }
  #endif
  
  // Connect to WiFi
  connectToWiFi();
  
  // Configure time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Setup MQTT
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqttCallback);
  client.setKeepAlive(MQTT_KEEPALIVE);
  
  Serial.println("Flood Mitigation System Started");
  Serial.println("================================");
  Serial.print("Sensor Height: ");
  Serial.print(SENSOR_HEIGHT_CM);
  Serial.println(" cm");
  Serial.print("Flow Sensor Factor: ");
  Serial.print(FLOW_SENSOR_FACTOR);
  Serial.println(" pulses/liter");
  Serial.println("================================");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  unsigned long currentTime = millis();
  
  // Read sensors based on configured intervals
  if (currentTime - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    publishSensorData();
    lastSensorRead = currentTime;
  }
  
  // Get weather data based on configured interval
  if (currentTime - lastWeatherRead >= WEATHER_UPDATE_INTERVAL) {
    getWeatherData();
    lastWeatherRead = currentTime;
  }
  
  // Generate flood prediction based on configured interval
  if (currentTime - lastPrediction >= PREDICTION_INTERVAL) {
    generateFloodPrediction();
    lastPrediction = currentTime;
  }
  
  delay(100);
}

void connectToWiFi() {
  #if ENABLE_STATIC_IP
  WiFi.config(STATIC_IP, GATEWAY, SUBNET);
  #endif
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  if (DEBUG_WIFI) {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
  }
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < WIFI_TIMEOUT_MS) {
    delay(500);
    if (DEBUG_WIFI) Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    if (DEBUG_WIFI) {
      Serial.println();
      Serial.println("WiFi connected!");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
      Serial.print("Signal strength: ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");
    }
  } else {
    Serial.println("WiFi connection failed!");
    Serial.println("Please check your WiFi credentials in config.h");
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    if (DEBUG_MQTT) {
      Serial.print("Attempting MQTT connection to ");
      Serial.print(MQTT_SERVER);
      Serial.print(":");
      Serial.print(MQTT_PORT);
      Serial.print(" as ");
      Serial.print(MQTT_CLIENT_ID);
      Serial.print("...");
    }
    
    if (client.connect(MQTT_CLIENT_ID)) {
      if (DEBUG_MQTT) Serial.println("connected");
    } else {
      if (DEBUG_MQTT) {
        Serial.print("failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 5 seconds");
      }
      delay(MQTT_RETRY_DELAY);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (DEBUG_MQTT) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    
    for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
    }
    Serial.println();
  }
}

// Flow sensor interrupt function
void flowPulseCounter() {
  flowPulseCount++;
}

// Function to get current timestamp
unsigned long getCurrentTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    // If NTP fails, use millis() as fallback
    return millis() / 1000;
  }
  return mktime(&timeinfo);
}

float readWaterLevel() {
  // HC-SR04 Ultrasonic sensor reading
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    if (DEBUG_SENSORS) Serial.println("HC-SR04: No echo received");
    return -1; // Error reading
  }
  
  float distance = duration * 0.034 / 2; // Convert to cm
  
  // Validate distance reading
  if (distance < MIN_DISTANCE_CM || distance > MAX_DISTANCE_CM) {
    if (DEBUG_SENSORS) {
      Serial.print("HC-SR04: Distance out of range: ");
      Serial.print(distance);
      Serial.println(" cm");
    }
    return -1; // Invalid reading
  }
  
  // Calculate water level based on sensor height
  float waterLevelCm = SENSOR_HEIGHT_CM - distance;
  
  // Ensure water level is not negative
  if (waterLevelCm < 0) waterLevelCm = 0;
  
  return waterLevelCm;
}

float readFlowRate() {
  // Calculate flow rate from pulse count
  if (millis() - oldTime > 1000) { // Calculate every second
    // Disable interrupts when calculating
    detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
    
    // Calculate flow rate in L/min using configured factor
    flowRate = (flowPulseCount / FLOW_SENSOR_FACTOR) * 60.0; // L/min
    
    if (DEBUG_SENSORS) {
      Serial.print("Flow pulses: ");
      Serial.print(flowPulseCount);
      Serial.print(", Rate: ");
      Serial.print(flowRate);
      Serial.println(" L/min");
    }
    
    flowPulseCount = 0;
    oldTime = millis();
    
    // Re-enable interrupts
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
  }
  
  return flowRate;
}

#if ENABLE_SENSOR_SMOOTHING
float smoothSensorData(float newValue, float* samples) {
  samples[sampleIndex] = newValue;
  
  float sum = 0;
  for (int i = 0; i < SMOOTHING_SAMPLES; i++) {
    sum += samples[i];
  }
  
  return sum / SMOOTHING_SAMPLES;
}
#endif

void readSensors() {
  float rawWaterLevel = readWaterLevel();
  float rawFlowRate = readFlowRate();
  
  // Handle sensor errors
  if (rawWaterLevel < 0) {
    Serial.println("Warning: Water level sensor error");
    return; // Skip this reading
  }
  
  #if ENABLE_SENSOR_SMOOTHING
  if (samplesReady) {
    waterLevel = smoothSensorData(rawWaterLevel, waterLevelSamples);
    flowRate = smoothSensorData(rawFlowRate, flowRateSamples);
  } else {
    waterLevel = rawWaterLevel;
    flowRate = rawFlowRate;
    sampleIndex = (sampleIndex + 1) % SMOOTHING_SAMPLES;
    if (sampleIndex == 0) samplesReady = true;
  }
  #else
  waterLevel = rawWaterLevel;
  flowRate = rawFlowRate;
  #endif
  
  if (DEBUG_SENSORS) {
    Serial.println("Sensor Readings:");
    Serial.println("================");
    Serial.print("Water Level: ");
    Serial.print(waterLevel);
    Serial.println(" cm");
    Serial.print("Flow Rate: ");
    Serial.print(flowRate);
    Serial.println(" L/min");
    Serial.println();
  }
}

void publishSensorData() {
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["timestamp"] = getCurrentTime(); // Fixed: menggunakan getCurrentTime()
  doc["waterLevel"] = round(waterLevel * 10) / 10.0; // Round to 1 decimal
  doc["flowRate"] = round(flowRate * 10) / 10.0;
  doc["rainfall"] = round(rainfall * 10) / 10.0;
  
  // Determine flood risk based on configured thresholds
  String floodRisk = "LOW";
  if (waterLevel >= RISK_CRITICAL_THRESHOLD) {
    floodRisk = "CRITICAL";
  } else if (waterLevel >= RISK_HIGH_THRESHOLD) {
    floodRisk = "HIGH";
  } else if (waterLevel >= RISK_MEDIUM_THRESHOLD) {
    floodRisk = "MEDIUM";
  }
  doc["floodRisk"] = floodRisk;
  
  // Convert to string
  String payload;
  serializeJson(doc, payload);
  
  // Publish to MQTT
  if (client.publish(SENSOR_TOPIC, payload.c_str())) {
    if (DEBUG_MQTT) Serial.println("✓ Sensor data published successfully");
  } else {
    Serial.println("✗ Failed to publish sensor data");
  }
}

void getWeatherData() {
  if (WiFi.status() == WL_CONNECTED && WEATHER_API_KEY != "YOUR_API_KEY_HERE") {
    HTTPClient http;
    http.begin(weatherUrl);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      // Parse JSON response
      StaticJsonDocument<1024> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (error) {
        Serial.print("Weather JSON parsing failed: ");
        Serial.println(error.c_str());
        http.end();
        return;
      }
      
      // Extract weather data
      float temperature = doc["main"]["temp"];
      float humidity = doc["main"]["humidity"];
      
      // Check if rain data exists
      if (doc.containsKey("rain")) {
        rainfall = doc["rain"]["1h"]; // Rain in last hour (mm)
      } else {
        rainfall = 0.0;
      }
      
      // Create weather JSON
      StaticJsonDocument<200> weatherDoc;
      weatherDoc["timestamp"] = getCurrentTime(); // Fixed: menggunakan getCurrentTime()
      weatherDoc["rainfall"] = round(rainfall * 10) / 10.0;
      weatherDoc["humidity"] = round(humidity * 10) / 10.0;
      weatherDoc["temperature"] = round(temperature * 10) / 10.0;
      
      String weatherPayload;
      serializeJson(weatherDoc, weatherPayload);
      
      // Publish weather data
      if (client.publish(WEATHER_TOPIC, weatherPayload.c_str())) {
        if (DEBUG_MQTT) Serial.println("✓ Weather data published successfully");
      }
      
      if (DEBUG_SENSORS) {
        Serial.println("Weather Data:");
        Serial.println("=============");
        Serial.print("Temperature: ");
        Serial.print(temperature);
        Serial.println("°C");
        Serial.print("Humidity: ");
        Serial.print(humidity);
        Serial.println("%");
        Serial.print("Rainfall: ");
        Serial.print(rainfall);
        Serial.println(" mm/h");
        Serial.println();
      }
    } else {
      Serial.print("Weather API HTTP error: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    if (DEBUG_SENSORS) Serial.println("Weather API: WiFi not connected or API key not set");
  }
}

void generateFloodPrediction() {
  // Enhanced flood prediction algorithm
  String riskLevel = "LOW";
  float probability = 0.0;
  int timeToFlood = 0;
  String recommendation = "Normal conditions. Continue monitoring.";
  
  // Calculate risk based on multiple factors with configured weights
  float riskScore = 0.0;
  
  // Water level factor (40% weight)
  float waterLevelRisk = (waterLevel / (RISK_CRITICAL_THRESHOLD * 1.5)) * 40.0;
  riskScore += fmin(waterLevelRisk, 40.0); // Fixed: menggunakan fmin()
  
  // Flow rate factor (30% weight)
  if (flowRate > FLOW_HIGH_THRESHOLD) {
    riskScore += 30.0;
  } else if (flowRate > FLOW_NORMAL_MAX) {
    riskScore += 15.0;
  }
  
  // Rainfall factor (30% weight)
  if (rainfall > 20) {
    riskScore += 30.0;
  } else if (rainfall > 10) {
    riskScore += 15.0;
  } else if (rainfall > 5) {
    riskScore += 7.5;
  }
  
  // Determine risk level and recommendations based on score
  probability = fmin(riskScore / 100.0, 1.0); // Fixed: menggunakan fmin()
  
  if (riskScore >= 75) {
    riskLevel = "CRITICAL";
    timeToFlood = 15; // 15 minutes
    recommendation = "IMMEDIATE EVACUATION REQUIRED! Flood imminent within 15 minutes.";
  } else if (riskScore >= 50) {
    riskLevel = "HIGH";
    timeToFlood = 45; // 45 minutes
    recommendation = "Prepare for evacuation. Flood likely within 45 minutes.";
  } else if (riskScore >= 25) {
    riskLevel = "MEDIUM";
    recommendation = "Monitor conditions closely. Consider moving to higher ground.";
  }
  
  // Create prediction JSON
  StaticJsonDocument<350> predictionDoc;
  predictionDoc["timestamp"] = getCurrentTime(); // Fixed: menggunakan getCurrentTime()
  predictionDoc["riskLevel"] = riskLevel;
  predictionDoc["probability"] = round(probability * 100) / 100.0;
  if (timeToFlood > 0) {
    predictionDoc["timeToFlood"] = timeToFlood;
  }
  predictionDoc["recommendation"] = recommendation;
  
  String predictionPayload;
  serializeJson(predictionDoc, predictionPayload);
  
  // Publish prediction
  if (client.publish(PREDICTION_TOPIC, predictionPayload.c_str())) {
    if (DEBUG_MQTT) Serial.println("✓ Flood prediction published successfully");
  } else {
    Serial.println("✗ Failed to publish flood prediction");
  }
  
  if (DEBUG_SENSORS) {
    Serial.println("Flood Prediction:");
    Serial.println("=================");
    Serial.print("Risk Level: ");
    Serial.println(riskLevel);
    Serial.print("Probability: ");
    Serial.print(probability * 100);
    Serial.println("%");
    Serial.print("Risk Score: ");
    Serial.println(riskScore);
    if (timeToFlood > 0) {
      Serial.print("Time to Flood: ");
      Serial.print(timeToFlood);
      Serial.println(" minutes");
    }
    Serial.print("Recommendation: ");
    Serial.println(recommendation);
    Serial.println("================================");
  }
}
