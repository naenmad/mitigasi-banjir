'use client';

import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { SensorData, WeatherData, FloodPrediction } from '@/types';

export const useMQTT = () => {
    const [client, setClient] = useState<mqtt.MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [floodPrediction, setFloodPrediction] = useState<FloodPrediction | null>(null);

    useEffect(() => {
        // HiveMQ Cloud broker configuration
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
            clientId: `dashboard-${Math.random().toString(16).substr(2, 8)}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        mqttClient.on('connect', () => {
            console.log('Connected to HiveMQ');
            setIsConnected(true);

            // Subscribe to topics
            mqttClient.subscribe([
                'flood-mitigation/sensors/data',
                'flood-mitigation/weather/data',
                'flood-mitigation/prediction/data'
            ], (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                switch (topic) {
                    case 'flood-mitigation/sensors/data':
                        setSensorData(data);
                        break;
                    case 'flood-mitigation/weather/data':
                        setWeatherData(data);
                        break;
                    case 'flood-mitigation/prediction/data':
                        setFloodPrediction(data);
                        break;
                }
            } catch (error) {
                console.error('Error parsing MQTT message:', error);
            }
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
            setIsConnected(false);
        });

        mqttClient.on('close', () => {
            console.log('MQTT Connection closed');
            setIsConnected(false);
        });

        setClient(mqttClient);

        return () => {
            if (mqttClient) {
                mqttClient.end();
            }
        };
    }, []);

    return {
        client,
        isConnected,
        sensorData,
        weatherData,
        floodPrediction
    };
};
