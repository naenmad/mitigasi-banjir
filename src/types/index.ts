export interface SensorData {
    timestamp: string;
    waterLevel: number; // cm
    flowRate: number; // L/min
    floodRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FloodPrediction {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number;
    timeToFlood?: number; // minutes
    recommendation: string;
}
