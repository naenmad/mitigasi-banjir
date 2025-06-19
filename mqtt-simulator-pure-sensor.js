/*
 * MQTT Simulator untuk Flood Mitigation System - PURE SENSOR VERSION
 * =================================================================
 * 
 * Simulator ini akan mengirim data sensor dummy ke MQTT broker
 * untuk testing dashboard tanpa hardware asli dan TANPA DATA RAINFALL.
 * 
 * KEUNGGULAN:
 * - 100% GRATIS - Tidak ada biaya API
 * - Fokus hanya pada sensor air (water level & flow rate)
 * - Testing lengkap tanpa hardware
 * - Flood scenario simulation berdasarkan sensor saja
 * 
 * Install dependencies:
 * npm install mqtt
 * 
 * Jalankan simulator:
 * node mqtt-simulator-pure-sensor.js
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const CLIENT_ID = 'flood-simulator-pure-' + Math.random().toString(16).substring(2, 8);

// MQTT Topics
const SENSOR_TOPIC = 'flood-mitigation/sensors/data';
const PREDICTION_TOPIC = 'flood-mitigation/prediction/data';

// Simulation variables
let waterLevel = 15.0; // Starting water level (cm)
let flowRate = 8.0;    // Starting flow rate (L/min)
let currentRiskLevel = 'LOW';

// Simulation parameters
let isFloodSimulation = false;
let simulationStep = 0;

console.log('🌊 Flood Mitigation MQTT Simulator - PURE SENSOR VERSION');
console.log('=========================================================');
console.log('💧 Focus: Water Level & Flow Rate sensors only');
console.log('📡 Connecting to MQTT broker:', MQTT_BROKER);
console.log('🆔 Client ID:', CLIENT_ID);

// Connect to MQTT
const client = mqtt.connect(MQTT_BROKER, {
    clientId: CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('✅ Connected to MQTT broker successfully!');
    console.log('📊 Publishing sensor data every 3 seconds...');
    console.log('');
    console.log('Controls:');
    console.log('- Press "f" + Enter: Start flood simulation');
    console.log('- Press "n" + Enter: Normal conditions');
    console.log('- Press "q" + Enter: Quit');
    console.log('');

    // Start publishing data
    setInterval(publishSensorData, 3000);
    setInterval(publishPredictionData, 5000);
});

client.on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
});

client.on('close', () => {
    console.log('🔌 Disconnected from MQTT broker');
});

// Simulate realistic sensor data
function simulateRealisticData() {
    const now = new Date();
    const hour = now.getHours();

    if (!isFloodSimulation) {
        // Normal conditions with small variations
        waterLevel = 15 + (Math.sin(Date.now() / 100000) * 3) + (Math.random() - 0.5) * 2;
        flowRate = 8 + (Math.cos(Date.now() / 80000) * 2) + (Math.random() - 0.5) * 1;

        // Ensure minimum values
        waterLevel = Math.max(5, waterLevel);
        flowRate = Math.max(2, flowRate);

        currentRiskLevel = 'LOW';
    } else {
        // Flood simulation - gradual increase
        simulationStep++;

        waterLevel = Math.min(50, waterLevel + simulationStep * 0.5);
        flowRate = Math.min(40, flowRate + simulationStep * 0.3);
    }

    // Determine risk level based on sensor data only
    if (waterLevel > 35) {
        currentRiskLevel = 'CRITICAL';
    } else if (waterLevel > 25) {
        currentRiskLevel = 'HIGH';
    } else if (waterLevel > 18) {
        currentRiskLevel = 'MEDIUM';
    } else {
        currentRiskLevel = 'LOW';
    }

    console.log(`📊 Sensor Reading:`);
    console.log(`   💧 Water Level: ${waterLevel.toFixed(1)} cm`);
    console.log(`   🌊 Flow Rate: ${flowRate.toFixed(1)} L/min`);
    console.log(`   ⚠️  Risk Level: ${currentRiskLevel}`);
    console.log('');
}

// Publish sensor data
function publishSensorData() {
    simulateRealisticData();

    const sensorPayload = {
        timestamp: new Date().toISOString(),
        waterLevel: parseFloat(waterLevel.toFixed(1)),
        flowRate: parseFloat(flowRate.toFixed(1)),
        floodRisk: currentRiskLevel
    };

    client.publish(SENSOR_TOPIC, JSON.stringify(sensorPayload), { qos: 0 }, (err) => {
        if (err) {
            console.error('❌ Failed to publish sensor data:', err);
        } else {
            console.log('📤 Sensor data published to:', SENSOR_TOPIC);
        }
    });
}

// Publish prediction data
function publishPredictionData() {
    // Calculate flood probability based on sensor data only
    let probability = 0;
    let timeToFlood = null;
    let recommendation = '';

    // Water level factor (primary)
    const waterFactor = Math.min((waterLevel / 40) * 100, 100);

    // Flow rate factor (secondary)
    const flowFactor = Math.min((flowRate / 30) * 100, 100);

    // Combined probability
    probability = (waterFactor * 0.7 + flowFactor * 0.3);

    // Determine recommendations and time estimates
    if (currentRiskLevel === 'CRITICAL') {
        recommendation = 'IMMEDIATE EVACUATION REQUIRED! Move to higher ground now!';
        timeToFlood = Math.max(5, Math.random() * 15); // 5-15 minutes
    } else if (currentRiskLevel === 'HIGH') {
        recommendation = 'Prepare for evacuation. Monitor conditions closely.';
        timeToFlood = Math.max(30, Math.random() * 60); // 30-60 minutes
    } else if (currentRiskLevel === 'MEDIUM') {
        recommendation = 'Stay alert. Avoid low-lying areas.';
    } else {
        recommendation = 'Conditions normal. Continue monitoring.';
    }

    const predictionPayload = {
        timestamp: new Date().toISOString(),
        riskLevel: currentRiskLevel,
        probability: Math.min(100, Math.max(0, probability)),
        timeToFlood: timeToFlood,
        recommendation: recommendation,
        factors: {
            waterLevel: parseFloat(waterFactor.toFixed(1)),
            flowRate: parseFloat(flowFactor.toFixed(1))
        }
    };

    client.publish(PREDICTION_TOPIC, JSON.stringify(predictionPayload), { qos: 0 }, (err) => {
        if (err) {
            console.error('❌ Failed to publish prediction data:', err);
        } else {
            console.log('🔮 Prediction data published to:', PREDICTION_TOPIC);
        }
    });
}

// Interactive controls
process.stdin.setEncoding('utf8');
process.stdin.on('data', (input) => {
    const command = input.toString().trim().toLowerCase();

    switch (command) {
        case 'f':
            console.log('\n🌊 STARTING FLOOD SIMULATION...');
            console.log('Water level and flow rate will gradually increase');
            isFloodSimulation = true;
            simulationStep = 0;
            break;

        case 'n':
            console.log('\n🌤️  RETURNING TO NORMAL CONDITIONS...');
            isFloodSimulation = false;
            simulationStep = 0;
            waterLevel = 15.0;
            flowRate = 8.0;
            break;

        case 'q':
            console.log('\n👋 Shutting down simulator...');
            client.end();
            process.exit(0);
            break;

        default:
            console.log('\n❓ Unknown command. Available commands:');
            console.log('   f = flood simulation');
            console.log('   n = normal conditions');
            console.log('   q = quit');
    }
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down simulator...');
    client.end();
    process.exit(0);
});

console.log('\n⌨️  Interactive mode ready. Type commands:');
