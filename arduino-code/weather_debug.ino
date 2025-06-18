/*
 * Weather API Debug Script
 * =======================
 * 
 * Script ini akan membantu debug masalah weather API
 * dan menampilkan response detail dari OpenWeatherMap
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Test weather API connection
void testWeatherAPI() {
  Serial.println("🌤️ Testing Weather API Connection...");
  Serial.println("================================");
  
  // Check WiFi first
  if (!WiFi.isConnected()) {
    Serial.println("❌ WiFi not connected!");
    return;
  }
  Serial.println("✅ WiFi connected: " + WiFi.localIP().toString());
  
  // Check API key
  if (WEATHER_API_KEY.length() < 10) {
    Serial.println("❌ Weather API key too short: " + String(WEATHER_API_KEY.length()) + " chars");
    Serial.println("💡 Get API key from: https://openweathermap.org/api");
    return;
  }
  Serial.println("✅ API Key length: " + String(WEATHER_API_KEY.length()) + " chars");
  
  // Build URL and test
  String url = "http://api.openweathermap.org/data/2.5/weather?q=" + 
               WEATHER_CITY + "," + WEATHER_COUNTRY + "&appid=" + WEATHER_API_KEY + "&units=metric";
  
  Serial.println("🔗 API URL: " + url);
  Serial.println();
  
  HTTPClient http;
  http.begin(url);
  http.setTimeout(10000); // 10 second timeout
  
  Serial.println("📡 Making HTTP request...");
  int httpCode = http.GET();
  
  Serial.println("📊 HTTP Response Code: " + String(httpCode));
  
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("📄 Response Length: " + String(payload.length()) + " bytes");
    Serial.println();
    Serial.println("📄 Raw Response:");
    Serial.println("================");
    Serial.println(payload);
    Serial.println("================");
    Serial.println();
    
    if (httpCode == HTTP_CODE_OK) {
      // Parse JSON response
      StaticJsonDocument<1024> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (error) {
        Serial.println("❌ JSON Parse Error: " + String(error.c_str()));
        return;
      }
      
      Serial.println("✅ JSON Parsed Successfully!");
      Serial.println("📊 Weather Data:");
      Serial.println("================");
      
      // Basic weather info
      float temp = doc["main"]["temp"];
      float hum = doc["main"]["humidity"];
      int condition = doc["weather"][0]["id"];
      String description = doc["weather"][0]["description"];
      
      Serial.println("🌡️ Temperature: " + String(temp) + "°C");
      Serial.println("💨 Humidity: " + String(hum) + "%");
      Serial.println("🌤️ Condition ID: " + String(condition));
      Serial.println("📝 Description: " + description);
      
      // Check rain data
      if (doc.containsKey("rain")) {
        Serial.println("🌧️ Rain data found!");
        
        if (doc["rain"].containsKey("1h")) {
          float rain1h = doc["rain"]["1h"];
          Serial.println("   Last 1 hour: " + String(rain1h) + "mm");
        }
        
        if (doc["rain"].containsKey("3h")) {
          float rain3h = doc["rain"]["3h"];
          Serial.println("   Last 3 hours: " + String(rain3h) + "mm");
        }
      } else {
        Serial.println("☀️ No rain data in response - Clear weather");
        Serial.println("💡 This is normal when there's no rain!");
      }
      
      // Check snow data
      if (doc.containsKey("snow")) {
        Serial.println("❄️ Snow data found!");
        if (doc["snow"].containsKey("1h")) {
          float snow1h = doc["snow"]["1h"];
          Serial.println("   Last 1 hour: " + String(snow1h) + "mm");
        }
      }
      
    } else {
      Serial.println("❌ HTTP Error: " + String(httpCode));
      
      // Common error codes
      switch (httpCode) {
        case 401:
          Serial.println("💡 Error 401: Invalid API key");
          Serial.println("   Check your WEATHER_API_KEY in config.h");
          break;
        case 404:
          Serial.println("💡 Error 404: City not found");
          Serial.println("   Check WEATHER_CITY and WEATHER_COUNTRY in config.h");
          break;
        case 429:
          Serial.println("💡 Error 429: API rate limit exceeded");
          Serial.println("   Wait a few minutes before trying again");
          break;
        default:
          Serial.println("💡 Check internet connection and API settings");
      }
    }
  } else {
    Serial.println("❌ HTTP Request Failed: " + http.errorToString(httpCode));
    Serial.println("💡 Check internet connection");
  }
  
  http.end();
  Serial.println("\n🔄 Test completed!");
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("🌤️ Weather API Debug Tool");
  Serial.println("==========================");
  
  // Connect to WiFi
  Serial.println("🔌 Connecting to WiFi: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.println("📡 IP: " + WiFi.localIP().toString());
    Serial.println("📶 Signal: " + String(WiFi.RSSI()) + " dBm");
    Serial.println();
    
    // Test weather API
    testWeatherAPI();
    
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
    Serial.println("💡 Check WIFI_SSID and WIFI_PASSWORD in config.h");
  }
}

void loop() {
  // Test every 30 seconds
  delay(30000);
  
  Serial.println("\n🔄 Running periodic test...");
  testWeatherAPI();
}
