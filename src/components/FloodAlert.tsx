'use client';

import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FloodPrediction } from '@/types';

interface FloodAlertProps {
    prediction: FloodPrediction | null;
    isConnected: boolean;
}

export const FloodAlert = ({ prediction, isConnected }: FloodAlertProps) => {
    if (!isConnected) {
        return (
            <div className="bg-gray-100 border-l-4 border-gray-500 p-4 mb-6">
                <div className="flex items-center">
                    <XCircle className="text-gray-500 mr-3" size={24} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Connection Lost</h3>
                        <p className="text-gray-600">Unable to connect to monitoring system</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex items-center">
                    <Clock className="text-blue-500 mr-3" size={24} />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-700">Waiting for Data</h3>
                        <p className="text-blue-600">Collecting sensor data for flood prediction...</p>
                    </div>
                </div>
            </div>
        );
    }

    const getAlertStyle = (risk: string) => {
        switch (risk) {
            case 'LOW':
                return {
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-500',
                    textColor: 'text-green-700',
                    icon: <CheckCircle className="text-green-500 mr-3" size={24} />
                };
            case 'MEDIUM':
                return {
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-500',
                    textColor: 'text-yellow-700',
                    icon: <AlertTriangle className="text-yellow-500 mr-3" size={24} />
                };
            case 'HIGH':
                return {
                    bgColor: 'bg-orange-100',
                    borderColor: 'border-orange-500',
                    textColor: 'text-orange-700',
                    icon: <AlertTriangle className="text-orange-500 mr-3" size={24} />
                };
            case 'CRITICAL':
                return {
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-700',
                    icon: <AlertTriangle className="text-red-500 mr-3" size={24} />
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-500',
                    textColor: 'text-gray-700',
                    icon: <AlertTriangle className="text-gray-500 mr-3" size={24} />
                };
        }
    };

    const alertStyle = getAlertStyle(prediction.riskLevel);

    return (
        <div className={`${alertStyle.bgColor} border-l-4 ${alertStyle.borderColor} p-4 mb-6`}>
            <div className="flex items-center">
                {alertStyle.icon}
                <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${alertStyle.textColor}`}>
                        Flood Risk: {prediction.riskLevel}
                    </h3>
                    <p className={`${alertStyle.textColor} mb-2`}>
                        Probability: {(prediction.probability * 100).toFixed(1)}%
                    </p>
                    {prediction.timeToFlood && (
                        <p className={`${alertStyle.textColor} mb-2`}>
                            Estimated time to flooding: {prediction.timeToFlood} minutes
                        </p>
                    )}
                    <p className={`${alertStyle.textColor} font-medium`}>
                        {prediction.recommendation}
                    </p>
                </div>
            </div>
        </div>
    );
};
