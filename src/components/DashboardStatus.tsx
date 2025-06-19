'use client';

import { AlertTriangle, Activity, Droplet } from 'lucide-react';
import { SensorData, FloodPrediction } from '@/types';

interface StatusCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    status: 'normal' | 'warning' | 'danger';
}

const StatusCard = ({ title, value, unit, icon, status }: StatusCardProps) => {
    const statusColors = {
        normal: 'bg-green-100 border-green-200 text-green-800',
        warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        danger: 'bg-red-100 border-red-200 text-red-800'
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-2xl font-bold">
                        {value} {unit && <span className="text-lg">{unit}</span>}
                    </p>
                </div>
                <div className="text-3xl opacity-60">
                    {icon}
                </div>
            </div>
        </div>
    );
};

interface DashboardStatusProps {
    sensorData: SensorData | null;
    floodPrediction: FloodPrediction | null;
}

export const DashboardStatus = ({ sensorData, floodPrediction }: DashboardStatusProps) => {
    const getWaterLevelStatus = (level: number) => {
        if (level < 20) return 'normal';
        if (level < 40) return 'warning';
        return 'danger';
    };

    const getFlowRateStatus = (rate: number) => {
        if (rate < 10) return 'normal';
        if (rate < 25) return 'warning';
        return 'danger';
    };

    const getRiskStatus = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'normal';
            case 'MEDIUM': return 'warning';
            case 'HIGH':
            case 'CRITICAL': return 'danger';
            default: return 'normal';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatusCard
                title="Water Level"
                value={sensorData?.waterLevel ?? '--'}
                unit="cm"
                icon={<Droplet />}
                status={sensorData ? getWaterLevelStatus(sensorData.waterLevel) : 'normal'}
            />

            <StatusCard
                title="Flow Rate"
                value={sensorData?.flowRate ?? '--'}
                unit="L/min"
                icon={<Activity />}
                status={sensorData ? getFlowRateStatus(sensorData.flowRate) : 'normal'}
            />

            <StatusCard
                title="Flood Risk"
                value={floodPrediction?.riskLevel ?? 'UNKNOWN'}
                icon={<AlertTriangle />}
                status={floodPrediction ? getRiskStatus(floodPrediction.riskLevel) : 'normal'}
            />
        </div>
    );
};
