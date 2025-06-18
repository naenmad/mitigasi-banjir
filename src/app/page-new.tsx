'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, BarChart3 } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { DashboardStatus } from '@/components/DashboardStatus';
import { FloodAlert } from '@/components/FloodAlert';
import { WaterLevelChart } from '@/components/WaterLevelChart';
import { FlowRateChart } from '@/components/FlowRateChart';
import { SensorData } from '@/types';

export default function Home() {
    const { isConnected, sensorData, floodPrediction } = useMQTT();
    const [historicalData, setHistoricalData] = useState<SensorData[]>([]);

    // Store historical data
    useEffect(() => {
        if (sensorData) {
            setHistoricalData(prev => {
                const newData = [...prev, sensorData];
                // Keep only last 50 data points
                return newData.slice(-50);
            });
        }
    }, [sensorData]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Shield className="text-blue-600" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Flood Mitigation Dashboard
                                </h1>
                                <p className="text-gray-600">
                                    Real-time monitoring and flood prediction system
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {isConnected ? (
                                <div className="flex items-center text-green-600">
                                    <Wifi size={20} className="mr-2" />
                                    <span className="font-medium">Connected</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <WifiOff size={20} className="mr-2" />
                                    <span className="font-medium">Disconnected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Flood Alert */}
                <FloodAlert prediction={floodPrediction} isConnected={isConnected} />

                {/* Status Cards */}
                <DashboardStatus sensorData={sensorData} floodPrediction={floodPrediction} />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center mb-4">
                            <BarChart3 className="text-blue-600 mr-2" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Water Level Trend</h2>
                        </div>
                        {historicalData.length > 0 ? (
                            <WaterLevelChart data={historicalData} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                Waiting for sensor data...
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center mb-4">
                            <BarChart3 className="text-green-600 mr-2" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Flow Rate Trend</h2>
                        </div>
                        {historicalData.length > 0 ? (
                            <FlowRateChart data={historicalData} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                Waiting for sensor data...
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Readings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Sensor Readings</h2>
                    {sensorData ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Water Level</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {sensorData.waterLevel} cm
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Flow Rate</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {sensorData.flowRate} L/min
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">Rainfall</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {sensorData.rainfall} mm/h
                                </p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">Last Update</p>
                                <p className="text-sm font-medium text-orange-600">
                                    {new Date(sensorData.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No sensor data available. Check your connection.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
