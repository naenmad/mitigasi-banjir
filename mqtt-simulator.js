const mqtt = require('mqtt');

// Connect to HiveMQ broker
const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
    clientId: 'flood-simulator-' + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

// Topics
const SENSOR_TOPIC = 'flood-mitigation/sensors/data';
const WEATHER_TOPIC = 'flood-mitigation/weather/data';
const PREDICTION_TOPIC = 'flood-mitigation/prediction/data';

// Simulation parameters
let waterLevel = 5; // Start at 5cm
let flowRate = 2; // Start at 2 L/min
let rainfall = 0; // Start with no rain

// Connect event
client.on('connect', () => {
    console.log('Connected to HiveMQ broker');
    console.log('Starting flood simulation...');
    console.log('================================');

    // Start simulation
    startSimulation();
});

// Error handling
client.on('error', (err) => {
    console.error('MQTT Error:', err);
});

function startSimulation() {
    // Send sensor data every 5 seconds
    setInterval(() => {
        sendSensorData();
    }, 5000);

    // Send weather data every 30 seconds
    setInterval(() => {
        sendWeatherData();
    }, 30000);

    // Send prediction every 15 seconds
    setInterval(() => {
        sendPrediction();
    }, 15000);

    // Simulate changing conditions every 10 seconds
    setInterval(() => {
        simulateConditions();
    }, 10000);
}

function simulateConditions() {
    // Simulate various scenarios
    const scenario = Math.random();

    if (scenario < 0.3) {
        // Normal conditions
        waterLevel = Math.max(0, waterLevel + (Math.random() - 0.5) * 2);
        flowRate = Math.max(0, flowRate + (Math.random() - 0.5) * 1);
        rainfall = Math.max(0, rainfall + (Math.random() - 0.7) * 2);
    } else if (scenario < 0.6) {
        // Light rain scenario
        rainfall = Math.min(15, rainfall + Math.random() * 3);
        waterLevel = Math.min(100, waterLevel + Math.random() * 3);
        flowRate = Math.min(30, flowRate + Math.random() * 2);
    } else if (scenario < 0.8) {
        // Heavy rain scenario
        rainfall = Math.min(25, rainfall + Math.random() * 5);
        waterLevel = Math.min(100, waterLevel + Math.random() * 5);
        flowRate = Math.min(50, flowRate + Math.random() * 4);
    } else {
        // Flood scenario
        rainfall = Math.min(40, rainfall + Math.random() * 8);
        waterLevel = Math.min(100, waterLevel + Math.random() * 8);
        flowRate = Math.min(80, flowRate + Math.random() * 6);
    }

    // Ensure minimum values
    waterLevel = Math.max(0, waterLevel);
    flowRate = Math.max(0, flowRate);
    rainfall = Math.max(0, rainfall);

    console.log(`Current conditions: Water Level: ${waterLevel.toFixed(1)}cm, Flow Rate: ${flowRate.toFixed(1)}L/min, Rainfall: ${rainfall.toFixed(1)}mm/h`);
}

function sendSensorData() {
    // Determine flood risk
    let floodRisk = 'LOW';
    if (waterLevel >= 60) {
        floodRisk = 'CRITICAL';
    } else if (waterLevel >= 40) {
        floodRisk = 'HIGH';
    } else if (waterLevel >= 20) {
        floodRisk = 'MEDIUM';
    }

    const sensorData = {
        timestamp: new Date().toISOString(),
        waterLevel: parseFloat(waterLevel.toFixed(1)),
        flowRate: parseFloat(flowRate.toFixed(1)),
        rainfall: parseFloat(rainfall.toFixed(1)),
        floodRisk: floodRisk
    };

    client.publish(SENSOR_TOPIC, JSON.stringify(sensorData), (err) => {
        if (err) {
            console.error('Failed to publish sensor data:', err);
        } else {
            console.log('✓ Sensor data published:', sensorData);
        }
    });
}

function sendWeatherData() {
    const weatherData = {
        timestamp: new Date().toISOString(),
        rainfall: parseFloat(rainfall.toFixed(1)),
        humidity: parseFloat((60 + Math.random() * 30).toFixed(1)), // 60-90%
        temperature: parseFloat((24 + Math.random() * 8).toFixed(1)) // 24-32°C
    };

    client.publish(WEATHER_TOPIC, JSON.stringify(weatherData), (err) => {
        if (err) {
            console.error('Failed to publish weather data:', err);
        } else {
            console.log('✓ Weather data published:', weatherData);
        }
    });
}

function sendPrediction() {
    // Calculate risk score
    let riskScore = 0;

    // Water level factor (0-40 points)
    riskScore += (waterLevel / 100) * 40;

    // Flow rate factor (0-30 points)
    if (flowRate > 20) {
        riskScore += 30;
    } else if (flowRate > 10) {
        riskScore += 15;
    }

    // Rainfall factor (0-30 points)
    if (rainfall > 20) {
        riskScore += 30;
    } else if (rainfall > 10) {
        riskScore += 15;
    } else if (rainfall > 5) {
        riskScore += 7.5;
    }

    // Determine risk level
    let riskLevel = 'LOW';
    let timeToFlood = null;
    let recommendation = 'Normal conditions. Continue monitoring.';

    if (riskScore >= 75) {
        riskLevel = 'CRITICAL';
        timeToFlood = 15;
        recommendation = 'IMMEDIATE EVACUATION REQUIRED! Flood imminent within 15 minutes.';
    } else if (riskScore >= 50) {
        riskLevel = 'HIGH';
        timeToFlood = 45;
        recommendation = 'Prepare for evacuation. Flood likely within 45 minutes.';
    } else if (riskScore >= 25) {
        riskLevel = 'MEDIUM';
        recommendation = 'Monitor conditions closely. Consider moving to higher ground.';
    }

    const predictionData = {
        timestamp: new Date().toISOString(),
        riskLevel: riskLevel,
        probability: parseFloat((riskScore / 100).toFixed(2)),
        recommendation: recommendation
    };

    if (timeToFlood) {
        predictionData.timeToFlood = timeToFlood;
    }

    client.publish(PREDICTION_TOPIC, JSON.stringify(predictionData), (err) => {
        if (err) {
            console.error('Failed to publish prediction data:', err);
        } else {
            console.log('✓ Prediction data published:', predictionData);
        }
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down simulator...');
    client.end();
    process.exit(0);
});

console.log('Flood Mitigation System Simulator');
console.log('=================================');
console.log('Press Ctrl+C to stop the simulator');
console.log('Connecting to HiveMQ broker...');
