/*
 * MQTT Simulator untuk Flood Mitigation System
 * ===========================================
 * 
 * Simulator ini akan mengirim data sensor dummy ke MQTT broker
 * untuk testing dashboard tanpa hardware asli.
 * 
 * Install dependencies:
 * npm install mqtt
 * 
 * Jalankan simulator:
 * node mqtt-simulator.js
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const CLIENT_ID = 'flood-simulator-' + Math.random().toString(16).substring(2, 8);

// MQTT Topics
const SENSOR_TOPIC = 'flood-mitigation/sensors/data';
const WEATHER_TOPIC = 'flood-mitigation/weather/data';
const PREDICTION_TOPIC = 'flood-mitigation/prediction/data';

// Simulation variables
let waterLevel = 15.0; // Starting water level
let flowRate = 8.0;    // Starting flow rate
let temperature = 26.0;
let humidity = 65.0;
let rainfall = 0.0;
let currentRiskLevel = 'LOW';

// Simulation parameters
let isFloodSimulation = false;
let simulationStep = 0;

console.log('🌊 Flood Mitigation MQTT Simulator');
console.log('===================================');
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
    console.log('⌨️  Press "f" + Enter to simulate flood scenario');
    console.log('⌨️  Press "r" + Enter to reset to normal conditions');
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
        rainfall = Math.min(25, simulationStep * 0.8);

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
        rainfall = Math.max(0, rainfall + (Math.random() - 0.7) * 2);

        // Keep within normal ranges
        waterLevel = Math.max(5, Math.min(25, waterLevel));
        flowRate = Math.max(3, Math.min(15, flowRate));

        currentRiskLevel = 'LOW';
    }

    // Temperature and humidity variations
    temperature += (Math.random() - 0.5) * 0.5;
    humidity += (Math.random() - 0.5) * 2;

    temperature = Math.max(20, Math.min(35, temperature));
    humidity = Math.max(50, Math.min(90, humidity));
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
        location: {
            lat: -6.302536,
            lon: 107.300224
        }
    };

    client.publish(SENSOR_TOPIC, JSON.stringify(data));

    // Console output
    const status = isFloodSimulation ? '🌊 FLOOD SIM' : '📊 NORMAL';
    console.log(`${status} | Water: ${data.waterLevel}cm | Flow: ${data.flowRate}L/min | Risk: ${currentRiskLevel}`);
}

function publishWeatherData() {
    const data = {
        deviceId: CLIENT_ID,
        timestamp: new Date().toISOString(),
        temperature: parseFloat(temperature.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        weatherCondition: rainfall > 10 ? 'rainy' : 'clear'
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
            console.log('\n⌨️  Commands: f=flood, r=reset, t=telegram test, q=quit');
    }

    console.log('');
}

async function testTelegramAlert() {
    try {
        const testMessage = `🧪 *Test Alert from Simulator*\n\n` +
            `📊 *Current Simulation Data:*\n` +
            `💧 Water Level: ${waterLevel.toFixed(1)} cm\n` +
            `🌊 Flow Rate: ${flowRate.toFixed(1)} L/min\n` +
            `🌡️ Temperature: ${temperature.toFixed(1)}°C\n` +
            `💨 Humidity: ${humidity.toFixed(0)}%\n` +
            `🌧️ Rainfall: ${rainfall.toFixed(1)} mm/h\n` +
            `⚠️ Risk Level: ${currentRiskLevel}\n` +
            `🕒 Time: ${new Date().toLocaleString()}\n\n` +
            `🤖 This is a test message from the MQTT simulator.`;

        const response = await fetch('http://localhost:3000/api/send-telegram', {
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
        } else {
            const error = await response.json();
            console.log('❌ Failed to send Telegram test:', error.error);
            console.log('💡 Make sure dashboard is running and Telegram is configured');
        }
    } catch (error) {
        console.log('❌ Error testing Telegram:', error.message);
        console.log('💡 Make sure dashboard is running on http://localhost:3000');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down simulator...');
    client.end();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down simulator...');
    client.end();
    process.exit(0);
});
