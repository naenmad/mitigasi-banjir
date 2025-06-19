/*
 * MQTT Simulator untuk Flood Mitigation System - NO API VERSION
 * =============================================================
 * 
 * Simulator ini akan mengirim data sensor dummy ke MQTT broker
 * untuk testing dashboard tanpa hardware asli dan TANPA API WEATHER.
 * 
 * KEUNGGULAN:
 * - 100% GRATIS - Tidak ada biaya API
 * - Data weather simulasi realistis
 * - Testing lengkap tanpa hardware
 * - Flood scenario simulation
 * 
 * Install dependencies:
 * npm install mqtt
 * 
 * Jalankan simulator:
 * node mqtt-simulator-no-api.js
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const CLIENT_ID = 'flood-simulator-no-api-' + Math.random().toString(16).substring(2, 8);

// MQTT Topics
const SENSOR_TOPIC = 'flood-mitigation/sensors/data';
const WEATHER_TOPIC = 'flood-mitigation/weather/data';
const PREDICTION_TOPIC = 'flood-mitigation/prediction/data';

// Simulation variables
let waterLevel = 15.0; // Starting water level
let flowRate = 8.0;    // Starting flow rate
let temperature = 27.0;
let humidity = 65.0;
let rainfall = 0.0;
let currentRiskLevel = 'LOW';

// Simulation parameters
let isFloodSimulation = false;
let simulationStep = 0;
let weatherCycle = 0; // For realistic weather patterns

console.log('🌊 Flood Mitigation MQTT Simulator - NO API VERSION');
console.log('===================================================');
console.log('💰 100% FREE - No weather API costs!');
console.log('📡 Connecting to MQTT broker:', MQTT_BROKER);
console.log('🆔 Client ID:', CLIENT_ID);

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER, {
    clientId: CLIENT_ID,
    keepalive: 60,
    reconnectPeriod: 1000,
    connectTimeout: 30000,
});

client.on('connect', () => {
    console.log('✅ Connected to MQTT broker!');
    console.log('📤 Publishing sensor data every 5 seconds...');
    console.log('💡 Weather data: Simulated (No API required)');
    console.log('');
    console.log('⌨️  Commands:');
    console.log('⌨️  Press "f" + Enter to simulate flood scenario');
    console.log('⌨️  Press "r" + Enter to reset to normal conditions');
    console.log('⌨️  Press "w" + Enter to simulate heavy rain');
    console.log('⌨️  Press "s" + Enter to simulate sunny weather');
    console.log('⌨️  Press "t" + Enter to test Telegram alert');
    console.log('⌨️  Press "q" + Enter to quit\n');

    // Start publishing data
    startSimulation();

    // Handle user input
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
            const input = chunk.trim().toLowerCase();
            handleUserInput(input);
        }
    });
});

client.on('error', (error) => {
    console.error('❌ MQTT connection error:', error);
});

client.on('close', () => {
    console.log('🔌 MQTT connection closed');
});

function startSimulation() {
    setInterval(() => {
        updateSensorValues();
        updateSimulatedWeather();
        publishSensorData();
        publishWeatherData();
        publishPredictionData();
    }, 5000);
}

function updateSensorValues() {
    if (isFloodSimulation) {
        // Simulate flood scenario
        simulationStep++;

        // Gradually increase water level and flow rate
        waterLevel = Math.min(80, 15 + (simulationStep * 2.5));
        flowRate = Math.min(35, 8 + (simulationStep * 1.5));

        // Add some randomness
        waterLevel += (Math.random() - 0.5) * 2;
        flowRate += (Math.random() - 0.5) * 1;

        // Determine risk level
        if (waterLevel >= 60) {
            currentRiskLevel = 'CRITICAL';
        } else if (waterLevel >= 40) {
            currentRiskLevel = 'HIGH';
        } else if (waterLevel >= 20) {
            currentRiskLevel = 'MEDIUM';
        } else {
            currentRiskLevel = 'LOW';
        }

    } else {
        // Normal random variations
        waterLevel += (Math.random() - 0.5) * 1;
        flowRate += (Math.random() - 0.5) * 0.5;

        // Keep within normal ranges
        waterLevel = Math.max(5, Math.min(25, waterLevel));
        flowRate = Math.max(3, Math.min(15, flowRate));

        currentRiskLevel = 'LOW';
    }
}

function updateSimulatedWeather() {
    weatherCycle++;

    // Simulate realistic daily temperature cycle
    const timeOfDay = (weatherCycle * 5) % 1440; // 5 seconds = 5 minutes in simulation
    const tempVariation = Math.sin((timeOfDay / 1440.0) * 2 * Math.PI) * 4; // ±4°C daily variation
    temperature = 27.0 + tempVariation + (Math.random() - 0.5) * 2;
    temperature = Math.max(22, Math.min(35, temperature));

    // Humidity inversely related to temperature
    humidity = 85 - (temperature - 27) * 2 + (Math.random() - 0.5) * 10;
    humidity = Math.max(40, Math.min(95, humidity));

    // Rainfall simulation with patterns
    const rainChance = Math.random() * 100;

    if (humidity > 80 && rainChance < 25) {
        // High humidity = higher rain chance
        rainfall = Math.random() * 15; // 0-15mm/h
    } else if (rainChance < 10) {
        // Random light rain
        rainfall = Math.random() * 5; // 0-5mm/h
    } else {
        // Clear weather
        rainfall = Math.max(0, rainfall - 0.5); // Gradually decrease
    }

    // Flood simulation increases rain
    if (isFloodSimulation && simulationStep > 5) {
        rainfall = Math.min(25, rainfall + simulationStep * 0.8);
    }
}

function publishSensorData() {
    const data = {
        deviceId: CLIENT_ID,
        timestamp: new Date().toISOString(),
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        flowRate: parseFloat(flowRate.toFixed(2)),
        temperature: parseFloat(temperature.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        riskLevel: currentRiskLevel,
        weatherSource: 'simulated',
        apiCost: 0.00,
        location: {
            lat: -6.302536,
            lon: 107.300224
        }
    };

    client.publish(SENSOR_TOPIC, JSON.stringify(data));

    // Console output with cost info
    const status = isFloodSimulation ? '🌊 FLOOD SIM' : '📊 NORMAL';
    const cost = '💰 $0.00';
    console.log(`${status} | Water: ${data.waterLevel}cm | Flow: ${data.flowRate}L/min | Risk: ${currentRiskLevel} | ${cost}`);
}

function publishWeatherData() {
    const data = {
        deviceId: CLIENT_ID,
        timestamp: new Date().toISOString(),
        temperature: parseFloat(temperature.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        weatherCondition: rainfall > 5 ? 'rainy' : rainfall > 0 ? 'drizzle' : 'clear',
        weatherSource: 'simulated',
        apiCost: 0.00
    };

    client.publish(WEATHER_TOPIC, JSON.stringify(data));
}

function publishPredictionData() {
    // Calculate risk factors
    const waterFactor = (waterLevel / 60) * 100;
    const flowFactor = (flowRate / 30) * 100;
    const rainFactor = (rainfall / 20) * 100;

    // Overall risk score
    const riskScore = (waterFactor * 0.4 + flowFactor * 0.3 + rainFactor * 0.3);

    let recommendation = '';
    let timeToFlood = null;

    if (currentRiskLevel === 'CRITICAL') {
        recommendation = 'IMMEDIATE EVACUATION REQUIRED! Flood imminent within 15 minutes.';
        timeToFlood = 15;
    } else if (currentRiskLevel === 'HIGH') {
        recommendation = 'HIGH FLOOD RISK! Prepare for evacuation. Monitor conditions closely.';
        timeToFlood = 45;
    } else if (currentRiskLevel === 'MEDIUM') {
        recommendation = 'Moderate flood risk. Stay alert and avoid low-lying areas.';
        timeToFlood = 120;
    } else {
        recommendation = 'Conditions normal. Continue monitoring.';
    }

    const data = {
        deviceId: CLIENT_ID,
        timestamp: new Date().toISOString(),
        riskLevel: currentRiskLevel,
        riskScore: parseFloat(riskScore.toFixed(1)),
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        flowRate: parseFloat(flowRate.toFixed(2)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        timeToFlood,
        recommendation,
        weatherSource: 'simulated',
        apiCost: 0.00,
        factors: {
            waterLevel: parseFloat(waterFactor.toFixed(1)),
            flowRate: parseFloat(flowFactor.toFixed(1)),
            rainfall: parseFloat(rainFactor.toFixed(1))
        }
    };

    client.publish(PREDICTION_TOPIC, JSON.stringify(data));
}

function handleUserInput(input) {
    switch (input) {
        case 'f':
            console.log('\n🌊 Starting flood simulation...');
            isFloodSimulation = true;
            simulationStep = 0;
            break;

        case 'r':
            console.log('\n🌤️  Resetting to normal conditions...');
            isFloodSimulation = false;
            simulationStep = 0;
            waterLevel = 15.0;
            flowRate = 8.0;
            rainfall = 0.0;
            currentRiskLevel = 'LOW';
            break;

        case 'w':
            console.log('\n🌧️  Simulating heavy rain...');
            rainfall = 15 + Math.random() * 10; // 15-25mm/h
            humidity = 90 + Math.random() * 5;
            break;

        case 's':
            console.log('\n☀️  Simulating sunny weather...');
            rainfall = 0;
            humidity = 50 + Math.random() * 15;
            temperature = 30 + Math.random() * 3;
            break;

        case 't':
            console.log('\n🤖 Testing Telegram alert...');
            testTelegramAlert();
            break;

        case 'q':
            console.log('\n👋 Stopping simulator...');
            client.end();
            process.exit(0);
            break;

        default:
            console.log('\n⌨️  Commands: f=flood, r=reset, w=rain, s=sunny, t=telegram test, q=quit');
    }

    console.log('');
}

async function testTelegramAlert() {
    try {
        const testMessage = `🧪 *Test Alert from NO-API Simulator*\n\n` +
            `💰 *Cost: $0.00 (No API Used)*\n\n` +
            `📊 *Current Simulation Data:*\n` +
            `💧 Water Level: ${waterLevel.toFixed(1)} cm\n` +
            `🌊 Flow Rate: ${flowRate.toFixed(1)} L/min\n` +
            `🌡️ Temperature: ${temperature.toFixed(1)}°C (Simulated)\n` +
            `💨 Humidity: ${humidity.toFixed(0)}% (Simulated)\n` +
            `🌧️ Rainfall: ${rainfall.toFixed(1)} mm/h (Simulated)\n` +
            `⚠️ Risk Level: ${currentRiskLevel}\n` +
            `🕒 Time: ${new Date().toLocaleString()}\n\n` +
            `✅ *System Status: 100% FREE Operation*\n` +
            `🤖 This is a test from the NO-API simulator.`;

        const response = await fetch('http://localhost:3002/api/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: 'YOUR_CHAT_ID_HERE', // Will be replaced by user
                message: testMessage,
                type: 'test'
            }),
        });

        if (response.ok) {
            console.log('✅ Telegram test message sent successfully!');
            console.log('💰 API Cost: $0.00 (FREE Forever!)');
        } else {
            const error = await response.json();
            console.log('❌ Failed to send Telegram test:', error.error);
            console.log('💡 Make sure dashboard is running and Telegram is configured');
        }
    } catch (error) {
        console.log('❌ Error testing Telegram:', error.message);
        console.log('💡 Make sure dashboard is running on http://localhost:3002');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down NO-API simulator...');
    console.log('💰 Total API cost during session: $0.00');
    client.end();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down NO-API simulator...');
    console.log('💰 Total API cost during session: $0.00');
    client.end();
    process.exit(0);
});
